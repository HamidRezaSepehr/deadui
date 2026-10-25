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
  DYE_RESOLUTION: 1024,
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

const BASE_VERTEX_SOURCE = `precision highp float;
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const BLUR_VERTEX_SOURCE = `precision highp float;
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const BLUR_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform float weight[5];
void main() {
  vec4 color = texture2D(uTexture, gl_FragCoord.xy / texelSize) * weight[0];
  for (int i = 1; i < 5; i++) {
    float w = weight[i];
    color += texture2D(uTexture, (gl_FragCoord.xy + float(i) * texelSize) / texelSize) * w;
    color += texture2D(uTexture, (gl_FragCoord.xy - float(i) * texelSize) / texelSize) * w;
  }
  gl_FragColor = color;
}`

const COPY_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTexture;
void main() {
  gl_FragColor = texture2D(uTexture, gl_FragCoord.xy / vec2(textureSize(uTexture, 0)));
}`

const CLEAR_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTexture;
uniform float value;
void main() {
  gl_FragColor = value * texture2D(uTexture, gl_FragCoord.xy / vec2(textureSize(uTexture, 0)));
}`

const COLOR_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTexture;
uniform vec3 color;
void main() {
  gl_FragColor = vec4(color, 1.0) * texture2D(uTexture, gl_FragCoord.xy / vec2(textureSize(uTexture, 0)));
}`

const DISPLAY_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform bool shading;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  vec3 color = texture2D(uTexture, uv).rgb;
  if (shading) {
    float dist = distance(uv, vec2(0.5));
    color *= 1.0 - dist * 0.3;
  }
  gl_FragColor = vec4(color, 1.0);
}`

const SPLAT_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec2 point;
uniform vec3 color;
uniform float radius;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(textureSize(uTarget, 0));
  vec2 p = point;
  float r = radius;
  if (aspectRatio > 1.0) { p.x *= aspectRatio; r *= aspectRatio; }
  float d = distance(uv, p);
  float a = smoothstep(r, 0.0, d);
  vec4 base = texture2D(uTarget, uv);
  vec4 splat = vec4(color, 1.0);
  gl_FragColor = mix(base, splat, a);
}`

const ADVECTION_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  vec2 velocity = texture2D(uVelocity, uv).rg;
  vec2 coord = uv - velocity * dt * texelSize;
  vec4 result = texture2D(uSource, coord);
  float decay = exp(-dissipation * dt);
  gl_FragColor = result * decay;
}`

const DIVERGENCE_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  float L = texture2D(uVelocity, uv - vec2(texelSize.x, 0.0)).r;
  float R = texture2D(uVelocity, uv + vec2(texelSize.x, 0.0)).r;
  float T = texture2D(uVelocity, uv + vec2(0.0, texelSize.y)).g;
  float B = texture2D(uVelocity, uv - vec2(0.0, texelSize.y)).g;
  float divergence = 0.5 * ((R - L) + (T - B));
  gl_FragColor = vec4(divergence, divergence, divergence, 1.0);
}`

const CURL_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  float L = texture2D(uVelocity, uv - vec2(texelSize.x, 0.0)).g;
  float R = texture2D(uVelocity, uv + vec2(texelSize.x, 0.0)).g;
  float T = texture2D(uVelocity, uv + vec2(0.0, texelSize.y)).r;
  float B = texture2D(uVelocity, uv - vec2(0.0, texelSize.y)).r;
  float curl = 0.5 * ((R - L) - (T - B));
  gl_FragColor = vec4(curl, curl, curl, 1.0);
}`

const VORTICITY_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
uniform vec2 texelSize;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  float L = texture2D(uCurl, uv - vec2(texelSize.x, 0.0)).r;
  float R = texture2D(uCurl, uv + vec2(texelSize.x, 0.0)).r;
  float T = texture2D(uCurl, uv + vec2(0.0, texelSize.y)).r;
  float B = texture2D(uCurl, uv - vec2(0.0, texelSize.y)).r;
  float vorticityForce = 0.5 * ((R - L) - (T - B));
  vec2 velocity = texture2D(uVelocity, uv).rg;
  vec2 force = vec2(vorticityForce * curl, vorticityForce * curl);
  gl_FragColor = vec4(velocity + force * dt, 0.0, 1.0);
}`

const PRESSURE_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uDivergence;
uniform sampler2D uPressure;
uniform vec2 texelSize;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  float L = texture2D(uPressure, uv - vec2(texelSize.x, 0.0)).r;
  float R = texture2D(uPressure, uv + vec2(texelSize.x, 0.0)).r;
  float T = texture2D(uPressure, uv + vec2(0.0, texelSize.y)).r;
  float B = texture2D(uPressure, uv - vec2(0.0, texelSize.y)).r;
  float divergence = texture2D(uDivergence, uv).r;
  float pressure = (L + R + T + B - divergence) * 0.25;
  gl_FragColor = vec4(pressure, pressure, pressure, 1.0);
}`

const GRADIENT_SUBTRACT_FRAGMENT_SOURCE = `precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
void main() {
  vec2 uv = gl_FragCoord.xy / texelSize;
  float pL = texture2D(uPressure, uv - vec2(texelSize.x, 0.0)).r;
  float pR = texture2D(uPressure, uv + vec2(texelSize.x, 0.0)).r;
  float pT = texture2D(uPressure, uv + vec2(0.0, texelSize.y)).r;
  float pB = texture2D(uPressure, uv - vec2(0.0, texelSize.y)).r;
  vec2 gradient = 0.5 * vec2(pR - pL, pT - pB);
  vec2 velocity = texture2D(uVelocity, uv).rg;
  gl_FragColor = vec4(velocity - gradient, 0.0, 1.0);
}`

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

    const gl = (canvas.getContext("webgl2", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }) ||
      canvas.getContext("webgl", {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      }) ||
      canvas.getContext("experimental-webgl", {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      })) as WebGLRenderingContext | WebGL2RenderingContext | null

    if (!gl) {
      console.warn("WebGL not supported")
      return
    }

    const ext = getExtensions(gl)
    if (!ext.supportLinearFiltering) {
      mergedConfig.DYE_RESOLUTION = 512
      mergedConfig.SHADING = false
    }

    const baseVertexShader = compileShader(gl.VERTEX_SHADER, BASE_VERTEX_SOURCE)
    const blurVertexShader = compileShader(gl.VERTEX_SHADER, BLUR_VERTEX_SOURCE)
    const blurShader = compileShader(gl.FRAGMENT_SHADER, BLUR_FRAGMENT_SOURCE)
    const copyShader = compileShader(gl.FRAGMENT_SHADER, COPY_FRAGMENT_SOURCE)
    const clearShader = compileShader(gl.FRAGMENT_SHADER, CLEAR_FRAGMENT_SOURCE)
    const colorShader = compileShader(gl.FRAGMENT_SHADER, COLOR_FRAGMENT_SOURCE)
    const displayShaderSource = DISPLAY_FRAGMENT_SOURCE
    const splatShader = compileShader(gl.FRAGMENT_SHADER, SPLAT_FRAGMENT_SOURCE)
    const advectionShader = compileShader(gl.FRAGMENT_SHADER, ADVECTION_FRAGMENT_SOURCE)
    const divergenceShader = compileShader(gl.FRAGMENT_SHADER, DIVERGENCE_FRAGMENT_SOURCE)
    const curlShader = compileShader(gl.FRAGMENT_SHADER, CURL_FRAGMENT_SOURCE)
    const vorticityShader = compileShader(gl.FRAGMENT_SHADER, VORTICITY_FRAGMENT_SOURCE)
    const pressureShader = compileShader(gl.FRAGMENT_SHADER, PRESSURE_FRAGMENT_SOURCE)
    const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, GRADIENT_SUBTRACT_FRAGMENT_SOURCE)

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

    let dye: any
    let velocity: any
    let divergence: any
    let curl: any
    let pressureFBO: any

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
      pressureFBO = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST)
    }

    const blit = (() => {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer()!)
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl!.STATIC_DRAW)
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer()!)
      gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl!.STATIC_DRAW)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
      gl!.enableVertexAttribArray(0)

      return (target: any, clear?: boolean) => {
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
        pointers.forEach((p: any) => {
          p.color = generateColor()
        })
      }
    }

    function applyInputs() {
      pointers.forEach((p: any) => {
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
      gl!.uniform1i(programs.clear.uniforms.uTexture, pressureFBO.read.attach(0))
      gl!.uniform1f(programs.clear.uniforms.value, mergedConfig.PRESSURE)
      blit(pressureFBO.write)
      pressureFBO.swap()

      programs.pressure.bind()
      gl!.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0))
      for (let i = 0; i < mergedConfig.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(programs.pressure.uniforms.uPressure, pressureFBO.read.attach(1))
        blit(pressureFBO.write)
        pressureFBO.swap()
      }

      programs.gradientSubtract.bind()
      gl!.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      gl!.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressureFBO.read.attach(0))
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

      displayMaterial.setKeywords(mergedConfig.SHADING ? ["SHADING"] : [])
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
      let r: number, g: number, b: number, i, f, p, q, t
      i = Math.floor(h * 6)
      f = h * 6 - i
      p = v * (1 - s)
      q = v * (1 - f * s)
      t = v * (1 - (1 - f) * s)
      switch (i % 6) {
        case 0: r = v; g = t; b = p; break
        case 1: r = q; g = v; b = p; break
        case 2: r = p; g = v; b = t; break
        case 3: r = p; g = q; b = v; break
        case 4: r = t; g = p; b = v; break
        case 5: r = v; g = p; b = q; break
        default: r = v; g = t; b = p
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
      let formatRGBA: any, formatRG: any, formatR: any

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
        supportLinearFiltering,
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

    // --- Event Listeners (inside main useEffect) ---
    const handleMouseDown = (e: MouseEvent) => {
      let pointer = pointers[0] || { id: -1, down: false, moved: false, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, color: generateColor() }
      pointers[0] = pointer
      let posX = scaleByPixelRatio(e.clientX)
      let posY = scaleByPixelRatio(e.clientY)
      updatePointerDownData(pointer, -1, posX, posY)
      clickSplat(pointer)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!pointers[0]) return
      let pointer = pointers[0]
      let posX = scaleByPixelRatio(e.clientX)
      let posY = scaleByPixelRatio(e.clientY)
      let color = pointer.color
      updatePointerMoveData(pointer, posX, posY, color)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touches = e.targetTouches
      let pointer = pointers[0] || { id: -1, down: false, moved: false, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, color: generateColor() }
      pointers[0] = pointer
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX)
        let posY = scaleByPixelRatio(touches[i].clientY)
        updatePointerDownData(pointer, touches[i].identifier, posX, posY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touches = e.targetTouches
      if (!pointers[0]) return
      let pointer = pointers[0]
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX)
        let posY = scaleByPixelRatio(touches[i].clientY)
        updatePointerMoveData(pointer, posX, posY, pointer.color)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touches = e.changedTouches
      if (!pointers[0]) return
      let pointer = pointers[0]
      for (let i = 0; i < touches.length; i++) {
        updatePointerUpData(pointer)
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouchStart, false)
    window.addEventListener('touchmove', handleTouchMove, false)
    window.addEventListener('touchend', handleTouchEnd, false)

    // --- Initialization ---
    updateKeywords()
    initFramebuffers()

    for (let i = 0; i < 5; i++) {
      const p = {
        texcoordX: Math.random(),
        texcoordY: Math.random(),
        deltaX: (Math.random() - 0.5) * 0.1,
        deltaY: (Math.random() - 0.5) * 0.1,
        color: generateColor(),
      }
      splatPointer(p)
    }

    function updateKeywords() {
      displayMaterial.setKeywords(mergedConfig.SHADING ? ["SHADING"] : [])
    }

    function update() {
      const dt = calcDeltaTime()
      if (resizeCanvas()) initFramebuffers()
      updateColors(dt)
      applyInputs()
      step(dt)
      render(null)
      animationFrameId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
      {...props}
    />
  )
}
