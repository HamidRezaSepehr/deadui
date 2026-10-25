# Feature 55: Fluid Simulation Component

## Overview
Add a free `FluidSimulation` component that renders a high-performance, interactive WebGL fluid dynamics simulation. Users can stir the "ink" with their mouse or touch, creating beautiful, swirling colorful trails that dissipate over time. This is a port of the popular Pavel Dobryakov / RunicFreak fluid effect, refactored for React.

## Goals
1. Create `registry/fluid-simulation/fluid-simulation.tsx` containing the full WebGL setup, shaders, and simulation loop.
2. Ensure zero external dependencies (pure Vanilla JS/WebGL inside React).
3. Expose key physics parameters as configurable props.
4. Handle cleanup properly (cancel RAF, remove listeners, lose WebGL context) on unmount.
5. Create a test page `app/test-fluid-simulation/page.tsx` with multiple variations (different colors/resolutions).
6. Create MDX documentation with a live preview/customizer.
7. Execute the 4-step Release Workflow for `v0.1.32` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/fluid-simulation/fluid-simulation.tsx`)

This component is large due to the embedded GLSL shaders. It must be copied exactly.

```tsx
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface FluidConfig {
  SIM_RESOLUTION?: number
  DYE_RESOLUTION?: number
  CAPTURE_RESOLUTION?: number
  DENSITY_DISSIPATION?: number
  VELOCITY_DISSIPATION?: number
  PRESSURE?: number
  PRESSURE_ITERATIONS?: number
  CURL?: number
  SPLAT_RADIUS?: number
  SPLAT_FORCE?: number
  SHADING?: boolean
  COLOR_UPDATE_SPEED?: number
  BACK_COLOR?: { r: number; g: number; b: number }
}

export interface FluidSimulationProps extends React.HTMLAttributes<HTMLCanvasElement> {
  config?: FluidConfig
  className?: string
}

const DEFAULT_CONFIG: Required<FluidConfig> = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024, // Reduced default for performance in previews
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 1,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: { r: 0, g: 0, b: 0 },
}

export function FluidSimulation({
  config = {},
  className,
  ...props
}: FluidSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animationFrameId: number
    let lastUpdateTime = Date.now()
    let colorUpdateTimer = 0.0
    let pointers: any[] = []
    
    // --- WebGL Setup ---
    const gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }) || 
               canvas.getContext("webgl", { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }) ||
               canvas.getContext("experimental-webgl", { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false });

    if (!gl) {
      console.warn("WebGL not supported")
      return
    }

    const ext = getExtensions(gl!)
    if (!ext.supportLinearFiltering) {
      mergedConfig.DYE_RESOLUTION = 512
      mergedConfig.SHADING = false
    }

    // --- Shaders & Programs ---
    // (Note: In a real implementation, these strings are huge. For brevity in this spec, 
    // I will describe the structure, but the AI MUST include the FULL GLSL strings 
    // from the provided CodePen source in the final file.)
    
    const baseVertexShader = compileShader(gl!.VERTEX_SHADER, BASE_VERTEX_SOURCE)
    const blurVertexShader = compileShader(gl!.VERTEX_SHADER, BLUR_VERTEX_SOURCE)
    const blurShader = compileShader(gl!.FRAGMENT_SHADER, BLUR_FRAGMENT_SOURCE)
    const copyShader = compileShader(gl!.FRAGMENT_SHADER, COPY_FRAGMENT_SOURCE)
    const clearShader = compileShader(gl!.FRAGMENT_SHADER, CLEAR_FRAGMENT_SOURCE)
    const colorShader = compileShader(gl!.FRAGMENT_SHADER, COLOR_FRAGMENT_SOURCE)
    const displayShaderSource = DISPLAY_FRAGMENT_SOURCE
    const splatShader = compileShader(gl!.FRAGMENT_SHADER, SPLAT_FRAGMENT_SOURCE)
    const advectionShader = compileShader(gl!.FRAGMENT_SHADER, ADVECTION_FRAGMENT_SOURCE)
    const divergenceShader = compileShader(gl!.FRAGMENT_SHADER, DIVERGENCE_FRAGMENT_SOURCE)
    const curlShader = compileShader(gl!.FRAGMENT_SHADER, CURL_FRAGMENT_SOURCE)
    const vorticityShader = compileShader(gl!.FRAGMENT_SHADER, VORTICITY_FRAGMENT_SOURCE)
    const pressureShader = compileShader(gl!.FRAGMENT_SHADER, PRESSURE_FRAGMENT_SOURCE)
    const gradientSubtractShader = compileShader(gl!.FRAGMENT_SHADER, GRADIENT_SUBTRACT_FRAGMENT_SOURCE)

    const programs = {
      blur: new Program(blurVertexShader, blurShader),
      copy: new Program(baseVertexShader, copyShader),
      clear: new Program(baseVertexShader, clearShader),
      color: new Program(baseVertexShader, colorShader),
      splat: new Program(baseVertexShader, splatShader),
      advection: new Program(baseVertexShader, advectionShader),
      divergence: new Program(baseVertexShader, divergenceShader),
      curl: new Program(baseVertexShader, curlShader),
      vorticity: new Program(baseVertexShader, vorticityShader),
      pressure: new Program(baseVertexShader, pressureShader),
      gradientSubtract: new Program(baseVertexShader, gradientSubtractShader),
    }
    
    const displayMaterial = new Material(baseVertexShader, displayShaderSource)

    // --- Framebuffers ---
    let dye: any, velocity: any, divergence: any, curl: any, pressure: any
    
    function initFramebuffers() {
      const simRes = getResolution(mergedConfig.SIM_RESOLUTION)
      const dyeRes = getResolution(mergedConfig.DYE_RESOLUTION)
      const texType = ext.halfFloatTexType
      const rgba = ext.formatRGBA
      const rg = ext.formatRG
      const r = ext.formatR
      const filtering = ext.supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST

      gl!.disable(gl!.BLEND)

      if (!dye)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
      else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)

      if (!velocity)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
      else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST)
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST)
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST)
    }

    // --- Helper Functions (Blit, Create FBO, etc.) ---
    // These functions (blit, createFBO, createDoubleFBO, resizeFBO, resizeDoubleFBO, 
    // createProgram, getUniforms, compileShader, addKeywords, hashCode, wrap, 
    // getResolution, scaleByPixelRatio, HSVtoRGB, generateColor, correctRadius, 
    // correctDeltaX, correctDeltaY) must be included EXACTLY as they appear 
    // in the reference CodePen JS, adapted to use the local `gl` variable.
    
    const blit = (() => {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer())
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl!.STATIC_DRAW)
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer())
      gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl!.STATIC_DRAW)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
      gl!.enableVertexAttribArray(0)

      return (target: any, clear = false) => {
        if (target == null) {
          gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight)
          gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
        } else {
          gl!.viewport(0, 0, target.width, target.height)
          gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo)
        }
        if (clear) {
          gl!.clearColor(0.0, 0.0, 0.0, 1.0)
          gl!.clear(gl!.COLOR_BUFFER_BIT)
        }
        gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0)
      }
    })()

    // ... [INSERT ALL OTHER HELPER FUNCTIONS HERE FROM REFERENCE CODE] ...

    // --- Simulation Loop ---
    function update() {
      const dt = calcDeltaTime()
      if (resizeCanvas()) initFramebuffers()
      updateColors(dt)
      applyInputs()
      step(dt)
      render(null)
      animationFrameId = requestAnimationFrame(update)
    }

    function calcDeltaTime() {
      let now = Date.now()
      let dt = (now - lastUpdateTime) / 1000
      dt = Math.min(dt, 0.016666)
      lastUpdateTime = now
      return dt
    }

    function resizeCanvas() {
      let width = scaleByPixelRatio(canvas.clientWidth)
      let height = scaleByPixelRatio(canvas.clientHeight)
      if (canvas.width != width || canvas.height != height) {
        canvas.width = width
        canvas.height = height
        return true
      }
      return false
    }

    function updateColors(dt: number) {
      colorUpdateTimer += dt * mergedConfig.COLOR_UPDATE_SPEED
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1)
        pointers.forEach((p) => {
          p.color = generateColor()
        })
      }
    }

    function applyInputs() {
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false
          splatPointer(p)
        }
      })
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND)

      programs.curl.bind()
      gl!.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0))
      blit(curl)

      programs.vorticity.bind()
      gl!.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0))
      gl!.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1))
      gl!.uniform1f(programs.vorticity.uniforms.curl, mergedConfig.CURL)
      gl!.uniform1f(programs.vorticity.uniforms.dt, dt)
      blit(velocity.write)
      velocity.swap()

      programs.divergence.bind()
      gl!.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0))
      blit(divergence)

      programs.clear.bind()
      gl!.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0))
      gl!.uniform1f(programs.clear.uniforms.value, mergedConfig.PRESSURE)
      blit(pressure.write)
      pressure.swap()

      programs.pressure.bind()
      gl!.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0))
      for (let i = 0; i < mergedConfig.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1))
        blit(pressure.write)
        pressure.swap()
      }

      programs.gradientSubtract.bind()
      gl!.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0))
      gl!.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write)
      velocity.swap()

      programs.advection.bind()
      gl!.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      if (!ext.supportLinearFiltering)
        gl!.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      let velocityId = velocity.read.attach(0)
      gl!.uniform1i(programs.advection.uniforms.uVelocity, velocityId)
      gl!.uniform1i(programs.advection.uniforms.uSource, velocityId)
      gl!.uniform1f(programs.advection.uniforms.dt, dt)
      gl!.uniform1f(programs.advection.uniforms.dissipation, mergedConfig.VELOCITY_DISSIPATION)
      blit(velocity.write)
      velocity.swap()

      if (!ext.supportLinearFiltering)
        gl!.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      gl!.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0))
      gl!.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1))
      gl!.uniform1f(programs.advection.uniforms.dissipation, mergedConfig.DENSITY_DISSIPATION)
      blit(dye.write)
      dye.swap()
    }

    function render(target: any) {
      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA)
      gl!.enable(gl!.BLEND)
      drawDisplay(target)
    }

    function drawDisplay(target: any) {
      let width = target == null ? gl!.drawingBufferWidth : target.width
      let height = target == null ? gl!.drawingBufferHeight : target.height

      displayMaterial.bind()
      if (mergedConfig.SHADING)
        gl!.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height)
      gl!.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
      blit(target)
    }

    function splatPointer(pointer: any) {
      let dx = pointer.deltaX * mergedConfig.SPLAT_FORCE
      let dy = pointer.deltaY * mergedConfig.SPLAT_FORCE
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color)
    }

    function clickSplat(pointer: any) {
      const color = generateColor()
      color.r *= 10.0
      color.g *= 10.0
      color.b *= 10.0
      let dx = 10 * (Math.random() - 0.5)
      let dy = 30 * (Math.random() - 0.5)
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color)
    }

    function splat(x: number, y: number, dx: number, dy: number, color: any) {
      programs.splat.bind()
      gl!.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0))
      gl!.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height)
      gl!.uniform2f(programs.splat.uniforms.point, x, y)
      gl!.uniform3f(programs.splat.uniforms.color, dx, dy, 0.0)
      gl!.uniform1f(programs.splat.uniforms.radius, correctRadius(mergedConfig.SPLAT_RADIUS / 100.0))
      blit(velocity.write)
      velocity.swap()

      gl!.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0))
      gl!.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b)
      blit(dye.write)
      dye.swap()
    }

    function correctRadius(radius: number) {
      let aspectRatio = canvas.width / canvas.height
      if (aspectRatio > 1) radius *= aspectRatio
      return radius
    }

    // --- Event Listeners ---
    function updatePointerDownData(pointer: any, id: number, posX: number, posY: number) {
      pointer.id = id
      pointer.down = true
      pointer.moved = false
      pointer.texcoordX = posX / canvas.width
      pointer.texcoordY = 1.0 - posY / canvas.height
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.deltaX = 0
      pointer.deltaY = 0
      pointer.color = generateColor()
    }

    function updatePointerMoveData(pointer: any, posX: number, posY: number, color: any) {
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / canvas.width
      pointer.texcoordY = 1.0 - posY / canvas.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
      pointer.color = color
    }

    function updatePointerUpData(pointer: any) {
      pointer.down = false
    }

    function correctDeltaX(delta: number) {
      let aspectRatio = canvas.width / canvas.height
      if (aspectRatio < 1) delta *= aspectRatio
      return delta
    }

    function correctDeltaY(delta: number) {
      let aspectRatio = canvas.width / canvas.height
      if (aspectRatio > 1) delta /= aspectRatio
      return delta
    }

    function generateColor() {
      let c = HSVtoRGB(Math.random(), 1.0, 1.0)
      c.r *= 0.15
      c.g *= 0.15
      c.b *= 0.15
      return c
    }

    function HSVtoRGB(h: number, s: number, v: number) {
      let r, g, b, i, f, p, q, t
      i = Math.floor(h * 6)
      f = h * 6 - i
      p = v * (1 - s)
      q = v * (1 - f * s)
      t = v * (1 - (1 - f) * s)
      switch (i % 6) {
        case 0: r = v, g = t, b = p; break
        case 1: r = q, g = v, b = p; break
        case 2: r = p, g = v, b = t; break
        case 3: r = p, g = q, b = v; break
        case 4: r = t, g = p, b = v; break
        case 5: r = v, g = p, b = q; break
      }
      return { r, g, b }
    }

    function wrap(value: number, min: number, max: number) {
      let range = max - min
      if (range == 0) return min
      return ((value - min) % range) + min
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio
      let min = Math.round(resolution)
      let max = Math.round(resolution * aspectRatio)
      if (gl!.drawingBufferWidth > gl!.drawingBufferHeight)
        return { width: max, height: min }
      else return { width: min, height: max }
    }

    function scaleByPixelRatio(input: number) {
      let pixelRatio = window.devicePixelRatio || 1
      return Math.floor(input * pixelRatio)
    }

    function hashCode(s: string) {
      if (s.length == 0) return 0
      let hash = 0
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i)
        hash |= 0
      }
      return hash
    }

    function getExtensions(g: WebGLRenderingContext | WebGL2RenderingContext) {
      const isWebGL2 = 'texStorage2D' in g
      let halfFloat: any, supportLinearFiltering: boolean | null
      
      if (isWebGL2) {
        ;(g as WebGL2RenderingContext).getExtension('EXT_color_buffer_float')
        supportLinearFiltering = !!(g as WebGL2RenderingContext).getExtension('OES_texture_float_linear')
      } else {
        halfFloat = (g as WebGLRenderingContext).getExtension('OES_texture_half_float')
        supportLinearFiltering = !!((g as WebGLRenderingContext).getExtension('OES_texture_half_float_linear'))
      }
      
      g.clearColor(0.0, 0.0, 0.0, 1.0)
      const halfFloatTexType = isWebGL2 ? (g as WebGL2RenderingContext).HALF_FLOAT : halfFloat.HALF_FLOAT_OES
      let formatRGBA, formatRG, formatR

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(g, (g as WebGL2RenderingContext).RGBA16F, (g as WebGL2RenderingContext).RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(g, (g as WebGL2RenderingContext).RG16F, (g as WebGL2RenderingContext).RG, halfFloatTexType)
        formatR = getSupportedFormat(g, (g as WebGL2RenderingContext).R16F, (g as WebGL2RenderingContext).RED, halfFloatTexType)
      } else {
        formatRGBA = getSupportedFormat(g, (g as WebGLRenderingContext).RGBA, (g as WebGLRenderingContext).RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(g, (g as WebGLRenderingContext).RGBA, (g as WebGLRenderingContext).RGBA, halfFloatTexType)
        formatR = getSupportedFormat(g, (g as WebGLRenderingContext).RGBA, (g as WebGLRenderingContext).RGBA, halfFloatTexType)
      }

      return {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering
      }
    }

    function getSupportedFormat(g: any, internalFormat: number, format: number, type: number) {
      if (!supportRenderTextureFormat(g, internalFormat, format, type)) {
        switch (internalFormat) {
          case g.R16F: return getSupportedFormat(g, g.RG16F, g.RG, type)
          case g.RG16F: return getSupportedFormat(g, g.RGBA16F, g.RGBA, type)
          default: return null
        }
      }
      return { internalFormat, format }
    }

    function supportRenderTextureFormat(g: any, internalFormat: number, format: number, type: number) {
      let texture = g.createTexture()
      g.bindTexture(g.TEXTURE_2D, texture)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.texImage2D(g.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)

      let fbo = g.createFramebuffer()
      g.bindFramebuffer(g.FRAMEBUFFER, fbo)
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0)

      let status = g.checkFramebufferStatus(g.FRAMEBUFFER)
      return status == g.FRAMEBUFFER_COMPLETE
    }

    class Material {
      vertexShader: WebGLShader
      fragmentShaderSource: string
      programs: any[]
      activeProgram: WebGLProgram | null
      uniforms: any

      constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
        this.vertexShader = vertexShader
        this.fragmentShaderSource = fragmentShaderSource
        this.programs = []
        this.activeProgram = null
        this.uniforms = {}
      }

      setKeywords(keywords: string[]) {
        let hash = 0
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i])
        let program = this.programs[hash]
        if (program == null) {
          let fragmentShader = compileShader(gl!.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
          program = createProgram(this.vertexShader, fragmentShader)
          this.programs[hash] = program
        }
        if (program == this.activeProgram) return
        this.uniforms = getUniforms(program)
        this.activeProgram = program
      }

      bind() {
        gl!.useProgram(this.activeProgram!)
      }
    }

    class Program {
      uniforms: any
      program: WebGLProgram

      constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        this.uniforms = {}
        this.program = createProgram(vertexShader, fragmentShader)
        this.uniforms = getUniforms(this.program)
      }

      bind() {
        gl!.useProgram(this.program)
      }
    }

    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      let program = gl!.createProgram()!
      gl!.attachShader(program, vertexShader)
      gl!.attachShader(program, fragmentShader)
      gl!.linkProgram(program)
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS))
        console.trace(gl!.getProgramInfoLog(program))
      return program
    }

    function getUniforms(program: WebGLProgram) {
      let uniforms: any = {}
      let uniformCount = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl!.getActiveUniform(program, i)!.name
        uniforms[uniformName] = gl!.getUniformLocation(program, uniformName)
      }
      return uniforms
    }

    function compileShader(type: number, source: string, keywords?: string[]) {
      source = addKeywords(source, keywords)
      const shader = gl!.createShader(type)!
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS))
        console.trace(gl!.getShaderInfoLog(shader))
      return shader
    }

    function addKeywords(source: string, keywords?: string[]) {
      if (keywords == null) return source
      let keywordsString = ''
      keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n'
      })
      return keywordsString + source
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      gl!.activeTexture(gl!.TEXTURE0)
      let texture = gl!.createTexture()
      gl!.bindTexture(gl!.TEXTURE_2D, texture)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

      let fbo = gl!.createFramebuffer()
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0)
      gl!.viewport(0, 0, w, h)
      gl!.clear(gl!.COLOR_BUFFER_BIT)

      let texelSizeX = 1.0 / w
      let texelSizeY = 1.0 / h

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id)
          gl!.bindTexture(gl!.TEXTURE_2D, texture)
          return id
        }
      }
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(w, h, internalFormat, format, type, param)
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1 },
        set read(value) { fbo1 = value },
        get write() { return fbo2 },
        set write(value) { fbo2 = value },
        swap() {
          let temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
        }
      }
    }

    function resizeFBO(target: any, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let newFBO = createFBO(w, h, internalFormat, format, type, param)
      programs.copy.bind()
      gl!.uniform1i(programs.copy.uniforms.uTexture, target.attach(0))
      blit(newFBO)
      return newFBO
    }

    function resizeDoubleFBO(target: any, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      if (target.width == w && target.height == h) return target
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param)
      target.write = createFBO(w, h, internalFormat, format, type, param)
      target.width = w
      target.height = h
      target.texelSizeX = 1.0 / w
      target.texelSizeY = 1.0 / h
      return target
    }

    // --- Initialization ---
    updateKeywords()
    initFramebuffers()
    
    // Add initial random splats
    for(let i=0; i<5; i++) {
       const p = {
         texcoordX: Math.random(),
         texcoordY: Math.random(),
         deltaX: (Math.random()-0.5)*0.1,
         deltaY: (Math.random()-0.5)*0.1,
         color: generateColor()
       }
       splatPointer(p)
    }

    update()

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId)
      // Remove listeners added below
    }
  }, [])

  // Attach event listeners separately to avoid closure issues with refs
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      // Logic handled inside main effect via shared state in a real prod build, 
      // but for this single-file constraint, we rely on the main effect's internal listeners.
      // NOTE: The AI must ensure listeners are attached INSIDE the main useEffect 
      // to access the `pointers` array correctly.
    }
    
    // IMPORTANT: The AI must move the window.addEventListener calls 
    // for mousemove, mousedown, touchstart, touchmove INTO the main useEffect block
    // so they share the same scope as `pointers`, `gl`, and `programs`.
    
    // For the sake of this spec, I am listing the listener attachment pattern 
    // that MUST be placed inside the main useEffect:
    
    /*
    window.addEventListener('mousedown', e => {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      updatePointerDownData(pointer, -1, posX, posY);
      clickSplat(pointer);
    });

    window.addEventListener('mousemove', e => {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      let color = pointer.color;
      updatePointerMoveData(pointer, posX, posY, color);
    });

    window.addEventListener('touchstart', e => {
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);  
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
      }
    });

    window.addEventListener('touchmove', e => {
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, posX, posY, pointer.color);
      }   
    }, false);

    window.addEventListener('touchend', e => {
      const touches = e.changedTouches;
      let pointer = pointers[0];  
      for (let i = 0; i < touches.length; i++) {
        updatePointerUpData(pointer);
      }
    });
    */

  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
      {...props}
    />
  )
}
```


(Self-Correction for AI: The code above has placeholders for the GLSL strings. The AI MUST replace BASE_VERTEX_SOURCE, BLUR_FRAGMENT_SOURCE, etc., with the actual long GLSL strings found in the reference CodePen JS. Do not leave them as variables.)


### 2. Registry Update (registry.json)
{
  "name": "fluid-simulation",
  "title": "Fluid Simulation",
  "description": "An interactive WebGL fluid dynamics effect where users can stir colorful ink trails with their cursor.",
  "tier": "free",
  "dependencies": [],
  "files": [
    {
      "path": "registry/fluid-simulation/fluid-simulation.tsx",
      "target": "components/ui/fluid-simulation.tsx"
    }
  ]
}

### 3. Test Page (app/test-fluid-simulation/page.tsx)
Create a page with 3 distinct examples to show configurability:
Standard: Default settings, dark background.
High Curl/Fast: Increased CURL and SPLAT_FORCE for more turbulent, energetic movement.
Low Res/Soft: Decreased SIM_RESOLUTION and increased DENSITY_DISSIPATION for a softer, slower-fading smoke look.


import { FluidSimulation } from "@/components/ui/fluid-simulation"

export default function TestFluidPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[50vh] border-b border-white/10">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          Standard Config
        </div>
        <FluidSimulation className="h-full w-full" />
      </section>

      <section className="relative h-[50vh] border-b border-white/10">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          High Turbulence (Curl: 50, Force: 8000)
        </div>
        <FluidSimulation 
          className="h-full w-full" 
          config={{ CURL: 50, SPLAT_FORCE: 8000 }} 
        />
      </section>

      <section className="relative h-[50vh]">
        <div className="absolute left-4 top-4 z-10 rounded bg-black/50 px-3 py-1 text-xs font-mono backdrop-blur">
          Soft Smoke (Low Res, High Dissipation)
        </div>
        <FluidSimulation 
          className="h-full w-full" 
          config={{ 
            SIM_RESOLUTION: 64, 
            DYE_RESOLUTION: 512,
            DENSITY_DISSIPATION: 2.5,
            VELOCITY_DISSIPATION: 1.0 
          }} 
        />
      </section>
    </main>
  )
}


### 4. Documentation (app/docs/components/fluid-simulation/page.mdx)
Explain that this is a heavy WebGL component and should ideally be used as a background element.
Document the config prop object with descriptions for each parameter (e.g., CURL: controls vorticity/swirliness).
Provide the installation command.
Show the basic usage snippet.


### 5. Release Workflow
Bump packages/cli/package.json to 0.1.32.
Commit, tag v0.1.32, push.
Provide manual npm publish commands at the end.
Verification Checklist
Canvas renders without black screen errors.
Mouse movement creates colorful trails.
Clicking creates a burst/splat.
Changing config props alters the behavior (e.g., higher CURL = more swirl).
No memory leaks when navigating away (check Chrome Memory tab).
Works on mobile (touch events).