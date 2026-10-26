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
  COLORFUL?: boolean
  PAUSED?: boolean
  TRANSPARENT?: boolean
  BACK_COLOR?: { r: number; g: number; b: number }
  BLOOM?: boolean
  BLOOM_ITERATIONS?: number
  BLOOM_RESOLUTION?: number
  BLOOM_INTENSITY?: number
  BLOOM_THRESHOLD?: number
  BLOOM_SOFT_KNEE?: number
  SUNRAYS?: boolean
  SUNRAYS_RESOLUTION?: number
  SUNRAYS_WEIGHT?: number
}

export interface FluidSimulationProps extends React.HTMLAttributes<HTMLCanvasElement> {
  config?: FluidConfig
  className?: string
}

const DEFAULT_CONFIG: Required<FluidConfig> = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 3.5,
  VELOCITY_DISSIPATION: 1.5,
  PRESSURE: 0.4,
  PRESSURE_ITERATIONS: 20,
  CURL: 15,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLOR_UPDATE_SPEED: 10,
  COLORFUL: true,
  PAUSED: false,
  TRANSPARENT: false,
  BACK_COLOR: { r: 0, g: 0, b: 0 },
  BLOOM: false,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
  SUNRAYS: false,
  SUNRAYS_RESOLUTION: 196,
  SUNRAYS_WEIGHT: 1.0,
}

function getGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | WebGL2RenderingContext | null {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
  let gl: WebGL2RenderingContext | null = canvas.getContext("webgl2", params as any) as WebGL2RenderingContext | null
  if (gl) return gl
  let gl1: WebGLRenderingContext | null = canvas.getContext("webgl", params as any) as WebGLRenderingContext | null
  if (gl1) return gl1
  return canvas.getContext("experimental-webgl", params as any) as WebGLRenderingContext | null
}

export function FluidSimulation({
  config = {},
  className,
  ...props
}: FluidSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const configRef = useRef(mergedConfig)
  configRef.current = mergedConfig

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas

    let animationFrameId: number
    let lastUpdateTime = Date.now()
    let colorUpdateTimer = 0.0
    let pointers: any[] = []

    const gl = getGLContext(canvas)

    if (!gl) {
      console.warn("WebGL not supported")
      return
    }
    const g = gl

    const ext = getExtensions(g)
    if (!ext.supportLinearFiltering) {
      configRef.current.DYE_RESOLUTION = 512
      configRef.current.SHADING = false
    }

    function pointerPrototype(this: any) {
      this.id = -1
      this.texcoordX = 0
      this.texcoordY = 0
      this.prevTexcoordX = 0
      this.prevTexcoordY = 0
      this.deltaX = 0
      this.deltaY = 0
      this.down = false
      this.moved = false
      this.color = { r: 30, g: 0, b: 300 }
    }

    pointers.push(new (pointerPrototype as any)())

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
          let fragmentShader = compileShader(g.FRAGMENT_SHADER, this.fragmentShaderSource, keywords)
          program = createProgram(this.vertexShader, fragmentShader)
          this.programs[hash] = program
        }
        if (program == this.activeProgram) return
        this.uniforms = getUniforms(program)
        this.activeProgram = program
      }

      bind() {
        g.useProgram(this.activeProgram!)
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
        g.useProgram(this.program)
      }
    }

    const baseVertexShader = compileShader(g.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `)

    const blurVertexShader = compileShader(g.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `)

    const blurShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      uniform sampler2D uTexture;
      void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
      }
    `)

    const copyShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `)

    const clearShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `)

    const colorShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec4 color;
      void main () {
        gl_FragColor = color;
      }
    `)

    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;
      vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
      }
    `

    const splatShader = compileShader(g.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `)

    const advectionShader = compileShader(g.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
      }
    `, ext.supportLinearFiltering ? undefined : ["MANUAL_FILTERING"])

    const divergenceShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `)

    const curlShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `)

    const vorticityShader = compileShader(g.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `)

    const pressureShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `)

    const gradientSubtractShader = compileShader(g.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `)

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

    let dye: any, velocity: any, divergence: any, curl: any, pressure: any

    function initFramebuffers() {
      const simRes = getResolution(configRef.current.SIM_RESOLUTION)
      const dyeRes = getResolution(configRef.current.DYE_RESOLUTION)
      const texType = ext.halfFloatTexType
      const rgba = ext.formatRGBA!
      const rg = ext.formatRG!
      const r = ext.formatR!
      const filtering = ext.supportLinearFiltering ? g.LINEAR : g.NEAREST

      g.disable(g.BLEND)

      if (!dye)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)
      else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering)

      if (!velocity)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)
      else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering)

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, g.NEAREST)
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, g.NEAREST)
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, g.NEAREST)
    }

    const blit = (() => {
      g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), g.STATIC_DRAW)
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, g.createBuffer())
      g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), g.STATIC_DRAW)
      g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
      g.enableVertexAttribArray(0)

      return (target: any, clear = false) => {
        if (target == null) {
          g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight)
          g.bindFramebuffer(g.FRAMEBUFFER, null)
        } else {
          g.viewport(0, 0, target.width, target.height)
          g.bindFramebuffer(g.FRAMEBUFFER, target.fbo)
        }
        if (clear) {
          g.clearColor(0.0, 0.0, 0.0, 1.0)
          g.clear(g.COLOR_BUFFER_BIT)
        }
        g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0)
      }
    })()

    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      let program = g.createProgram()!
      g.attachShader(program, vertexShader)
      g.attachShader(program, fragmentShader)
      g.linkProgram(program)
      if (!g.getProgramParameter(program, g.LINK_STATUS))
        console.trace(g.getProgramInfoLog(program))
      return program
    }

    function getUniforms(program: WebGLProgram) {
      let uniforms: any = {}
      let uniformCount = g.getProgramParameter(program, g.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = g.getActiveUniform(program, i)!.name
        uniforms[uniformName] = g.getUniformLocation(program, uniformName)
      }
      return uniforms
    }

    function compileShader(type: number, source: string, keywords?: string[]) {
      source = addKeywords(source, keywords)
      const shader = g.createShader(type)!
      g.shaderSource(shader, source)
      g.compileShader(shader)
      if (!g.getShaderParameter(shader, g.COMPILE_STATUS))
        console.trace(g.getShaderInfoLog(shader))
      return shader
    }

    function addKeywords(source: string, keywords?: string[]) {
      if (keywords == null) return source
      let keywordsString = ""
      keywords.forEach(keyword => {
        keywordsString += "#define " + keyword + "\n"
      })
      return keywordsString + source
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      g.activeTexture(g.TEXTURE0)
      let texture = g.createTexture()
      g.bindTexture(g.TEXTURE_2D, texture)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, param)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, param)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.texImage2D(g.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

      let fbo = g.createFramebuffer()
      g.bindFramebuffer(g.FRAMEBUFFER, fbo)
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0)
      g.viewport(0, 0, w, h)
      g.clear(g.COLOR_BUFFER_BIT)

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
          g.activeTexture(g.TEXTURE0 + id)
          g.bindTexture(g.TEXTURE_2D, texture)
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
      g.uniform1i(programs.copy.uniforms.uTexture, target.attach(0))
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

    function updateKeywords() {
      let displayKeywords: string[] = []
      if (String(configRef.current.SHADING) !== "false") displayKeywords.push("SHADING")
      displayMaterial.setKeywords(displayKeywords)
    }

    function update() {
      const dt = calcDeltaTime()
      if (resizeCanvas()) initFramebuffers()
      if (String(configRef.current.PAUSED) !== "true") {
        updateColors(dt)
        applyInputs()
        step(dt)
        render(null)
      }
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
      let width = scaleByPixelRatio(c.clientWidth)
      let height = scaleByPixelRatio(c.clientHeight)
      if (c.width != width || c.height != height) {
        c.width = width
        c.height = height
        return true
      }
      return false
    }

    function updateColors(dt: number) {
      colorUpdateTimer += dt * configRef.current.COLOR_UPDATE_SPEED
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
      g.disable(g.BLEND)

      programs.curl.bind()
      g.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      g.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0))
      blit(curl)

      programs.vorticity.bind()
      g.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      g.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0))
      g.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1))
      g.uniform1f(programs.vorticity.uniforms.curl, configRef.current.CURL)
      g.uniform1f(programs.vorticity.uniforms.dt, dt)
      blit(velocity.write)
      velocity.swap()

      programs.divergence.bind()
      g.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      g.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0))
      blit(divergence)

      programs.clear.bind()
      g.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0))
      g.uniform1f(programs.clear.uniforms.value, configRef.current.PRESSURE)
      blit(pressure.write)
      pressure.swap()

      programs.pressure.bind()
      g.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      g.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0))
      for (let i = 0; i < configRef.current.PRESSURE_ITERATIONS; i++) {
        g.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1))
        blit(pressure.write)
        pressure.swap()
      }

      programs.gradientSubtract.bind()
      g.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      g.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0))
      g.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write)
      velocity.swap()

      programs.advection.bind()
      g.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
      if (!ext.supportLinearFiltering)
        g.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
      let velocityId = velocity.read.attach(0)
      g.uniform1i(programs.advection.uniforms.uVelocity, velocityId)
      g.uniform1i(programs.advection.uniforms.uSource, velocityId)
      g.uniform1f(programs.advection.uniforms.dt, dt)
      g.uniform1f(programs.advection.uniforms.dissipation, configRef.current.VELOCITY_DISSIPATION)
      blit(velocity.write)
      velocity.swap()

      if (!ext.supportLinearFiltering)
        g.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
      g.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0))
      g.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1))
      g.uniform1f(programs.advection.uniforms.dissipation, configRef.current.DENSITY_DISSIPATION)
      blit(dye.write)
      dye.swap()
    }

    function render(target: any) {
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA)
      g.enable(g.BLEND)
      drawDisplay(target)
    }

    function drawDisplay(target: any) {
      let width = target == null ? g.drawingBufferWidth : target.width
      let height = target == null ? g.drawingBufferHeight : target.height

      displayMaterial.bind()
      if (String(configRef.current.SHADING) !== "false")
        g.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height)
      g.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0))
      blit(target)
    }

    function splatPointer(pointer: any) {
      let dx = pointer.deltaX * configRef.current.SPLAT_FORCE
      let dy = pointer.deltaY * configRef.current.SPLAT_FORCE
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
      g.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0))
      g.uniform1f(programs.splat.uniforms.aspectRatio, c.width / c.height)
      g.uniform2f(programs.splat.uniforms.point, x, y)
      g.uniform3f(programs.splat.uniforms.color, dx, dy, 0.0)
      g.uniform1f(programs.splat.uniforms.radius, correctRadius(configRef.current.SPLAT_RADIUS / 100.0))
      blit(velocity.write)
      velocity.swap()

      g.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0))
      g.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b)
      blit(dye.write)
      dye.swap()
    }

    function correctRadius(radius: number) {
      let aspectRatio = c.width / c.height
      if (aspectRatio > 1) radius *= aspectRatio
      return radius
    }

    function updatePointerDownData(pointer: any, id: number, posX: number, posY: number) {
      pointer.id = id
      pointer.down = true
      pointer.moved = false
      pointer.texcoordX = posX / c.width
      pointer.texcoordY = 1.0 - posY / c.height
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.deltaX = 0
      pointer.deltaY = 0
      pointer.color = generateColor()
    }

    function updatePointerMoveData(pointer: any, posX: number, posY: number, color: any) {
      pointer.prevTexcoordX = pointer.texcoordX
      pointer.prevTexcoordY = pointer.texcoordY
      pointer.texcoordX = posX / c.width
      pointer.texcoordY = 1.0 - posY / c.height
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
      pointer.color = color
    }

    function updatePointerUpData(pointer: any) {
      pointer.down = false
    }

    function correctDeltaX(delta: number) {
      let aspectRatio = c.width / c.height
      if (aspectRatio < 1) delta *= aspectRatio
      return delta
    }

    function correctDeltaY(delta: number) {
      let aspectRatio = c.width / c.height
      if (aspectRatio > 1) delta /= aspectRatio
      return delta
    }

    function generateColor() {
      let c = HSVtoRGB(Math.random(), 1.0, 1.0)
      if (String(configRef.current.COLORFUL) !== "false") {
        c.r *= 0.15
        c.g *= 0.15
        c.b *= 0.15
      } else {
        c.r *= 0.05
        c.g *= 0.05
        c.b *= 0.05
      }
      return c
    }

    function HSVtoRGB(h: number, s: number, v: number) {
      let r: number, g: number, b: number, i: number, f: number, p: number, q: number, t: number
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
        default: r = 0; g = 0; b = 0
      }
      return { r: r!, g: g!, b: b! }
    }

    function wrap(value: number, min: number, max: number) {
      let range = max - min
      if (range == 0) return min
      return ((value - min) % range) + min
    }

    function getResolution(resolution: number) {
      let aspectRatio = g.drawingBufferWidth / g.drawingBufferHeight
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio
      let min = Math.round(resolution)
      let max = Math.round(resolution * aspectRatio)
      if (g.drawingBufferWidth > g.drawingBufferHeight)
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
      const isWebGL2 = "texStorage2D" in g
      let halfFloat: any, supportLinearFiltering: any
      if (isWebGL2) {
        ;(g as WebGL2RenderingContext).getExtension("EXT_color_buffer_float")
        supportLinearFiltering = !!(g as WebGL2RenderingContext).getExtension("OES_texture_float_linear")
      } else {
        halfFloat = (g as WebGLRenderingContext).getExtension("OES_texture_half_float")
        supportLinearFiltering = !!((g as WebGLRenderingContext).getExtension("OES_texture_half_float_linear"))
      }
      g.clearColor(0.0, 0.0, 0.0, 1.0)
      const halfFloatTexType = isWebGL2 ? (g as any).HALF_FLOAT : halfFloat!.HALF_FLOAT_OES
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

    updateKeywords()
    initFramebuffers()

    for (let i = 0; i < 5; i++) {
      const p = {
        texcoordX: Math.random(),
        texcoordY: Math.random(),
        deltaX: (Math.random() - 0.5) * 0.1,
        deltaY: (Math.random() - 0.5) * 0.1,
        color: generateColor()
      }
      splatPointer(p)
    }

    let started = false

    function canvasPos(clientX: number, clientY: number) {
      const rect = c.getBoundingClientRect()
      return {
        x: scaleByPixelRatio(clientX - rect.left),
        y: scaleByPixelRatio(clientY - rect.top),
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      const p = canvasPos(e.clientX, e.clientY)
      let pointer = pointers[0]
      updatePointerDownData(pointer, -1, p.x, p.y)
      clickSplat(pointer)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const p = canvasPos(e.clientX, e.clientY)
      if (!started) {
        started = true
        let pointer = pointers[0]
        let color = generateColor()
        update()
        updatePointerMoveData(pointer, p.x, p.y, color)
        return
      }
      let pointer = pointers[0]
      let color = pointer.color
      updatePointerMoveData(pointer, p.x, p.y, color)
    }

    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.targetTouches.length; i++) {
        const p = canvasPos(e.targetTouches[i].clientX, e.targetTouches[i].clientY)
        if (!started) {
          started = true
          update()
        }
        updatePointerDownData(pointers[0], e.targetTouches[i].identifier, p.x, p.y)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.targetTouches.length; i++) {
        const p = canvasPos(e.targetTouches[i].clientX, e.targetTouches[i].clientY)
        updatePointerMoveData(pointers[0], p.x, p.y, pointers[0].color)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        updatePointerUpData(pointers[0])
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)

    update()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
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