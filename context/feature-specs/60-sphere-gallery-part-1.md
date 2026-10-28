# Feature 60: Sphere Gallery Component (Part 1: Infrastructure & Shaders)

## Overview
This part establishes the foundational WebGL architecture required for the `SphereGallery`. It includes a global `WebglProvider` that manages a single persistent `<Canvas>`, a `Teleport` system to inject scene graphs from arbitrary DOM locations into that canvas, and the specific GLSL shader materials used for the spherical tiles and post-processing lens blur.

## Goals
1. Create `registry/webgl-provider/webgl-portal.tsx`: A minimal React Portal implementation using `useSyncExternalStore` to bridge standard React trees with the R3F Canvas tree.
2. Create `registry/webgl-provider/webgl-provider.tsx`: The root provider that mounts the `<Canvas>`, drives the animation loop via `motion/react`'s `frame.postRender` (for perfect sync with Lenis/Motion), and handles overlay/effect composition.
3. Create `registry/webgl-provider/webgl-scene.tsx`: A wrapper component that measures a DOM element's bounding box and renders its children into an off-screen buffer (or scissor test region) aligned with that DOM element. This is crucial for placing the 3D sphere exactly where the HTML container is.
4. Define the `TileMaterial` and `LensBlurMaterial` shaders within the scope of these files or a shared shader utility if preferred, but for strict adherence to the source, they are defined inline in the scene/gallery files. *Correction*: Based on the provided code, `TileMaterial` and `LensBlurMaterial` are defined in `sphere-gallery.tsx`. However, `DisplayMaterial` is in `webgl-scene.tsx`. We will define `DisplayMaterial` here. The Tile/Lens shaders will be passed to Part 2.

## Technical Specifications

### 1. Webgl Portal (`registry/webgl-provider/webgl-portal.tsx`)

This file implements the "Teleport" pattern. It allows React components outside the `<Canvas>` to register children that should be rendered *inside* the Canvas.

```tsx
"use client"

import {
    type ReactNode,
    Suspense,
    useEffect,
    useId,
    useLayoutEffect,
    useSyncExternalStore,
} from "react"

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

// Minimal teleport: <In> registers children in an external store,
// <Out> renders them — bridges across the Canvas React root the same
function WebglTeleport() {
    const items = new Map<string, ReactNode>()
    const listeners = new Set<() => void>()
    let snapshot: [string, ReactNode][] = []

    const emit = () => {
        snapshot = Array.from(items.entries())
        for (const listener of listeners) {
            listener()
        }
    }

    const subscribe = (listener: () => void) => {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }
    const getSnapshot = () => snapshot

    function useItems() {
        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    }

    return {
        In({ children }: { children: ReactNode }) {
            const id = useId()

            useIsoLayoutEffect(() => {
                items.set(id, children)
                emit()
                return () => {
                    items.delete(id)
                    emit()
                }
            }, [id, children])
            return null
        },
        useItems,
        Out() {
            const list = useItems()
            return (
                <>
                    {list.map(([id, node]) => (
                        <Suspense key={id} fallback={null}>
                            {node}
                        </Suspense>
                    ))}
                </>
            )
        },
    }
}

const webglTeleport = WebglTeleport()
const effectTeleport = WebglTeleport()
const overlayTeleport = WebglTeleport()

export function WebglPortal() {
    return <webglTeleport.Out />
}

export { effectTeleport, overlayTeleport, webglTeleport }
```

### 2. Webgl Provider (registry/webgl-provider/webgl-provider.tsx)
This component must wrap the application (or at least the section containing the gallery). It creates the single <Canvas> instance. Note the use of frameloop="never" and manual advancement via motion's frame ticker to ensure synchronization with scroll animations (Lenis).

```tsx
"use client"

import {
    advance,
    Canvas,
    type CanvasProps,
    createPortal,
    useFrame,
    useStore,
    useThree,
} from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { cancelFrame, type FrameData, frame } from "motion/react"
import { type ComponentRef, type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { type Camera, Scene, UnsignedByteType } from "three"
import { effectTeleport, overlayTeleport, WebglPortal } from "./webgl-portal"

type WebglProviderProps = Omit<CanvasProps, "children" | "eventSource"> & {
    children: ReactNode
    className?: string
    contained?: boolean
}

type WebglReadyOptions = {
    scene?: Scene
    camera?: Camera
    enabled?: boolean
    onReady?: () => void
}

export function useWebglReady({ scene, camera, enabled = true, onReady }: WebglReadyOptions = {}) {
    const [ready, setReady] = useState(false)
    const gl = useThree((state) => state.gl)
    const defaultScene = useThree((state) => state.scene)
    const defaultCamera = useThree((state) => state.camera)
    const onReadyRef = useRef(onReady)
    onReadyRef.current = onReady

    const targetScene = scene ?? defaultScene
    const targetCamera = camera ?? defaultCamera

    useEffect(() => {
        if (!enabled) return
        let active = true

        gl.compileAsync(targetScene, targetCamera).then(() => {
            if (!active) return
            requestAnimationFrame(() => {
                if (!active) return
                setReady(true)
                onReadyRef.current?.()
            })
        })

        return () => {
            active = false
        }
    }, [gl, targetScene, targetCamera, enabled])

    return ready
}

// Renders in Motion's `postRender` phase, after Lenis and Motion have
// updated. One shared driver serves every mounted provider.
type CanvasStore = ReturnType<typeof useStore>
const canvasStores = new Set<CanvasStore>()
let clockStart: number | null = null

function tick(data: FrameData) {
    if (clockStart === null) clockStart = data.timestamp

    // frameloop="never" expects the elapsed clock time in seconds.
    const elapsed = (data.timestamp - clockStart) / 1000

    let runGlobalEffects = true
    for (const store of canvasStores) {
        const state = store.getState()
        if (state.internal.active) {
            advance(elapsed, runGlobalEffects, state)
            runGlobalEffects = false
        }
    }
}

function MotionFrameloop() {
    const store = useStore()

    useEffect(() => {
        canvasStores.add(store)
        if (canvasStores.size === 1) frame.postRender(tick, true)
        return () => {
            canvasStores.delete(store)
            if (canvasStores.size === 0) cancelFrame(tick)
        }
    }, [store])

    return null
}

function RootRender() {
    const gl = useThree((state) => state.gl)
    const scene = useThree((state) => state.scene)
    const camera = useThree((state) => state.camera)

    useFrame(() => gl.render(scene, camera), 1)

    return null
}

function OverlayRender() {
    const gl = useThree((state) => state.gl)
    const camera = useThree((state) => state.camera)
    const scene = useMemo(() => new Scene(), [])

    useFrame(() => {
        const previousAutoClear = gl.autoClear
        gl.autoClear = false
        gl.clearDepth()
        gl.render(scene, camera)
        gl.autoClear = previousAutoClear
    }, 2)

    return createPortal(<overlayTeleport.Out />, scene)
}

function Effects() {
    const effects = effectTeleport.useItems()
    const gl = useThree((state) => state.gl)
    const mounted = effects.length > 0

    // EffectComposer sets `renderer.autoClear = false` and never restores it;
    // without this the canvas keeps its last frame once the composer unmounts.
    useEffect(() => {
        if (!mounted) return
        return () => {
            gl.autoClear = true
        }
    }, [mounted, gl])

    if (!mounted) return <RootRender />

    return (
        <EffectComposer key={effects.length} multisampling={0} frameBufferType={UnsignedByteType}>
            <effectTeleport.Out />
        </EffectComposer>
    )
}

export function WebglProvider({
    children,
    className,
    style,
    contained = false,
    ...canvasProps
}: WebglProviderProps) {
    const [eventSource, setEventSource] = useState<ComponentRef<"div"> | null>(null)

    return (
        <div
            ref={setEventSource}
            data-atelier-webgl=""
            className={className}
            style={contained ? { position: "relative" } : { display: "contents" }}
        >
            <Canvas
                eventPrefix="client"
                dpr={[1, 1.8]}
                {...canvasProps}
                frameloop="never"
                eventSource={eventSource ?? undefined}
                style={{
                    position: contained ? "absolute" : "fixed",
                    inset: 0,
                    pointerEvents: "none",
                    ...style,
                }}
            >
                <MotionFrameloop />
                <WebglPortal />
                <Effects />
                <OverlayRender />
            </Canvas>

            {children}
        </div>
    )
}
```

### 3. Webgl Scene Wrapper (registry/webgl-provider/webgl-scene.tsx)
This component acts as the bridge between the DOM element (the container div) and the 3D world. It uses createPortal to move the 3D children into the main scene but adjusts the camera/viewport to match the DOM element's position.

```tsx
"use client"

import { shaderMaterial, useFBO } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from "react"
import { type Mesh, PerspectiveCamera, Scene, Texture } from "three"
import { webglTeleport } from "./webgl-portal"

const DisplayMaterial = shaderMaterial(
    { uMap: new Texture() },
    /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uMap;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(uMap, vUv);
        }
    `,
)

extend({ DisplayMaterial })

declare module "@react-three/fiber" {
    interface ThreeElements {
        displayMaterial: ThreeElement<typeof DisplayMaterial>
    }
}

export type WebglSceneProps = {
    track: RefObject<HTMLElement | null>
    children: ReactNode
    camera?: PerspectiveCamera
    /**
     * - texture: children render into an FBO each frame: Global post-processing will work on it.
     * - scissor: a scissored pass painted on top of the composed frame. lighter, but excluded from global post-processing.
     */
    mode?: "texture" | "scissor"
    priority?: number
    zIndex?: number
    transparent?: boolean
    /**
     * Re-measures the DOM rect every frame so the plane follows animated parents (motion, parallax).
     * Costs one layout read per frame, so only enable it when needed.
     */
    autoReflow?: boolean
}

function WebglScenePortal({
    track,
    children,
    camera: propCamera,
    mode = "scissor",
    priority,
    zIndex = 0,
    transparent = true,
    autoReflow = false,
}: WebglSceneProps) {
    const defaultCamera = useMemo(() => {
        const cam = new PerspectiveCamera(75, 1, 0.1, 1000)
        cam.position.z = 5
        return cam
    }, [])

    const scene = useMemo(() => new Scene(), [])
    const camera = propCamera ?? defaultCamera
    const bounds = useRef({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    const gl = useThree((s) => s.gl)
    const size = useThree((s) => s.size)
    const viewport = useThree((s) => s.viewport)
    const displayMesh = useRef<Mesh>(null)
    const fbo = useFBO(1, 1, { samples: 4 })

    useLayoutEffect(() => {
        fbo.texture.colorSpace = gl.outputColorSpace
    }, [fbo, gl])

    useLayoutEffect(() => {
        const target = track.current
        if (!target) return

        const measure = () => {
            const rect = target.getBoundingClientRect()
            bounds.current.x = rect.left + window.scrollX
            bounds.current.y = rect.top + window.scrollY
            bounds.current.width = rect.width
            bounds.current.height = rect.height
        }

        measure()
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(target)
        resizeObserver.observe(document.body)
        return () => resizeObserver.disconnect()
    }, [track])

    const renderPriority = priority ?? (mode === "texture" ? 0 : 2)

    useFrame(() => {
        const transitioning = document.documentElement.hasAttribute("data-atelier-transitioning")

        let left: number
        let top: number
        let width: number
        let height: number

        if ((autoReflow || transitioning) && track.current) {
            const rect = track.current.getBoundingClientRect()
            left = rect.left
            top = rect.top
            width = rect.width
            height = rect.height
        } else {
            const b = bounds.current
            left = b.x - window.scrollX
            top = b.y - window.scrollY
            width = b.width
            height = b.height
        }

        if (width === 0 || height === 0) return

        const aspect = width / height
        if (camera.aspect !== aspect) {
            camera.aspect = aspect
            camera.updateProjectionMatrix()
        }

        if (mode === "scissor") {
            const canvasHeight = gl.domElement.clientHeight
            const canvasWidth = gl.domElement.clientWidth

            const previousAutoClear = gl.autoClear
            gl.autoClear = false
            gl.setViewport(left, canvasHeight - (top + height), width, height)
            gl.setScissor(left, canvasHeight - (top + height), width, height)
            gl.setScissorTest(true)
            gl.clear()
            gl.render(scene, camera)
            gl.setScissorTest(false)
            gl.setViewport(0, 0, canvasWidth, canvasHeight)
            gl.setScissor(0, 0, canvasWidth, canvasHeight)
            gl.autoClear = previousAutoClear
            return
        }

        const pixelRatio = gl.getPixelRatio()
        const fboWidth = Math.max(1, Math.ceil(width * pixelRatio))
        const fboHeight = Math.max(1, Math.ceil(height * pixelRatio))

        if (fbo.width !== fboWidth || fbo.height !== fboHeight) {
            fbo.setSize(fboWidth, fboHeight)
        }

        const previousClearAlpha = gl.getClearAlpha()
        const previousAutoClear = gl.autoClear

        gl.autoClear = true
        gl.setRenderTarget(fbo)
        gl.setClearAlpha(transparent ? 0 : 1)
        gl.clear()
        gl.render(scene, camera)
        gl.setRenderTarget(null)
        gl.setClearAlpha(previousClearAlpha)
        gl.autoClear = previousAutoClear

        const mesh = displayMesh.current

        if (mesh) {
            const pxToWorld = viewport.height / size.height
            mesh.position.x = (left + width / 2 - size.width / 2) * pxToWorld
            mesh.position.y = -(top + height / 2 - size.height / 2) * pxToWorld
            mesh.scale.x = width * pxToWorld
            mesh.scale.y = height * pxToWorld
        }
    }, renderPriority)

    const portal = createPortal(children, scene, {
        camera,
        events: {
            compute: (event, state) => {
                const rect = track.current?.getBoundingClientRect()
                if (!rect) return
                state.pointer.set(
                    ((event.clientX - rect.left) / rect.width) * 2 - 1,
                    -(((event.clientY - rect.top) / rect.height) * 2 - 1),
                )
                state.raycaster.setFromCamera(state.pointer, camera)
            },
        },
    })

    return (
        <>
            {portal}
            {mode === "texture" && (
                <mesh ref={displayMesh} renderOrder={zIndex}>
                    <planeGeometry args={[1, 1]} />
                    <displayMaterial
                        key={DisplayMaterial.key}
                        uMap={fbo.texture}
                        transparent
                        premultipliedAlpha
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </>
    )
}

export function WebglScene(props: WebglSceneProps) {
    return (
        <webglTeleport.In>
            <WebglScenePortal {...props} />
        </webglTeleport.In>
    )
}
```

### Dependencies for Part 1
Ensure package.json includes:
three
@react-three/fiber
@react-three/drei
@react-three/postprocessing
motion (specifically motion/react for the frame ticker)


### Verification Checklist for Part 1
WebglProvider mounts without errors.
WebglScene correctly tracks a dummy div's position.
No TypeScript errors regarding ThreeElements augmentation.
(End of Part 1)