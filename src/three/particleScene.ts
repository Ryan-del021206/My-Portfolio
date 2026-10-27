import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

/*
  One Points object per section, each with its own fixed shape. Every shape
  lives inside its section and scrolls with the page 1:1 – nothing travels or
  morphs between sections. Page order: planet (hero) → helix (story) → MONO
  logo → blocks (projects) → orbits (stack) → wave (process) → ring (contact).
*/

export interface SceneTarget {
  shape: number
  x: number
  y: number
  scale: number
  opacity: number
  /** Rotation speed in rad/s; 0 turns the shape back to face the viewer. */
  spin: number
  /** Forward tilt in radians. */
  tilt: number
  /** Live rotation to copy instead of spinning on its own (the stack globe). */
  follow?: { x: number; y: number }
}

const TAU = Math.PI * 2

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type Gen = (i: number, n: number, out: Float32Array) => void

const sphere: Gen = (i, n, out) => {
  // Fibonacci sphere with a little surface noise: a planet of points.
  const y = 1 - (i / (n - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const theta = i * 2.399963
  const bump = 1 + (rand(i) - 0.5) * 0.08
  out[i * 3] = Math.cos(theta) * r * 1.7 * bump
  out[i * 3 + 1] = y * 1.7 * bump
  out[i * 3 + 2] = Math.sin(theta) * r * 1.7 * bump
}

const helix: Gen = (i, n, out) => {
  // Double helix with rungs – "what I'm made of".
  const t = i / n
  const kind = i % 10
  const h = (t - 0.5) * 4.6
  const a = t * TAU * 3.2
  const strand = kind < 4 ? 0 : kind < 8 ? Math.PI : -1
  let x: number
  let z: number
  if (strand >= 0) {
    x = Math.cos(a + strand) * 0.95
    z = Math.sin(a + strand) * 0.95
  } else {
    const s = rand(i) * 2 - 1
    x = Math.cos(a) * 0.95 * s
    z = Math.sin(a) * 0.95 * s
  }
  out[i * 3] = x + (rand(i + 1) - 0.5) * 0.06
  out[i * 3 + 1] = h
  out[i * 3 + 2] = z + (rand(i + 2) - 0.5) * 0.06
}

const monoLogo: Gen = (i, _n, out) => {
  // The MONO icon: a 270° arc, a small dot and a centre dot (from MONO-Icon.svg).
  const k = rand(i)
  const depth = (rand(i + 7) - 0.5) * 0.18
  let x: number
  let y: number
  if (k < 0.78) {
    const a = -Math.PI / 2 + rand(i + 3) * Math.PI * 1.5
    const r = 1.55 + (rand(i + 4) - 0.5) * 0.24
    x = Math.cos(a) * r
    y = -Math.sin(a) * r
  } else {
    const big = k < 0.93
    const cx = big ? 0 : -1.05
    const cy = big ? 0 : 1.05
    const rad = (big ? 0.42 : 0.2) * Math.sqrt(rand(i + 5))
    const a = rand(i + 6) * TAU
    x = cx + Math.cos(a) * rad
    y = cy + Math.sin(a) * rad
  }
  out[i * 3] = x
  out[i * 3 + 1] = y
  out[i * 3 + 2] = depth
}

const blocks: Gen = (i, _n, out) => {
  // Points along the edges of a 3×3×3 lattice of cubes: building blocks.
  const grid = [-1.275, -0.425, 0.425, 1.275]
  const line = i % 48
  const axis = Math.floor(line / 16)
  const a = grid[line % 4]!
  const b = grid[Math.floor((line % 16) / 4)]!
  const t = (rand(i) - 0.5) * 2.55
  const [x, y, z] = axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t]
  out[i * 3] = x
  out[i * 3 + 1] = y
  out[i * 3 + 2] = z
}

const orbit: Gen = (i, _n, out) => {
  // Three tilted orbits around a small core.
  const ring = i % 4
  const a = rand(i) * TAU
  if (ring === 3) {
    const r = 0.5 * Math.cbrt(rand(i + 1))
    const u = rand(i + 2) * 2 - 1
    const s = Math.sqrt(1 - u * u)
    out[i * 3] = Math.cos(a) * s * r
    out[i * 3 + 1] = u * r
    out[i * 3 + 2] = Math.sin(a) * s * r
    return
  }
  const r = 1.4 + ring * 0.35 + (rand(i + 3) - 0.5) * 0.05
  const tilt = (ring - 1) * 0.9
  const x = Math.cos(a) * r
  const z = Math.sin(a) * r
  out[i * 3] = x
  out[i * 3 + 1] = z * Math.sin(tilt)
  out[i * 3 + 2] = z * Math.cos(tilt)
}

const wave: Gen = (i, n, out) => {
  // A rolling landscape, seen from slightly above.
  const side = Math.ceil(Math.sqrt(n))
  const gx = (i % side) / side - 0.5
  const gz = Math.floor(i / side) / side - 0.5
  const x = gx * 7
  const z = gz * 4
  out[i * 3] = x
  out[i * 3 + 1] = Math.sin(x * 1.3) * 0.25 + Math.cos(z * 2.1 + x * 0.4) * 0.22 - 0.6
  out[i * 3 + 2] = z
}

const ring: Gen = (i, _n, out) => {
  // A torus: an open door.
  const u = rand(i) * TAU
  const v = rand(i + 1) * TAU
  const R = 1.6
  const r = 0.32 + (rand(i + 2) - 0.5) * 0.08
  out[i * 3] = (R + r * Math.cos(v)) * Math.cos(u)
  out[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u)
  out[i * 3 + 2] = r * Math.sin(v)
}

const generators: Gen[] = [sphere, helix, monoLogo, blocks, orbit, wave, ring]
export const SHAPE_COUNT = generators.length

const vertexShader = /* glsl */ `
  attribute vec3 aRand;
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uMouse;
  uniform float uMouseForce;
  uniform float uAspect;
  varying float vMix;
  varying float vSpark;

  void main() {
    vec3 p = position;
    // Each point breathes on its own phase.
    p += 0.035 * vec3(sin(uTime * 0.9 + aRand.x * 40.0), cos(uTime * 0.7 + aRand.y * 40.0), sin(uTime * 0.8 + aRand.z * 40.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;

    // Push points away from the cursor in screen space.
    vec2 ndc = clip.xy / clip.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float dist = length(d);
    float push = smoothstep(0.32, 0.0, dist) * uMouseForce;
    clip.xy += normalize(d + 1e-5) * push * clip.w * 0.12;

    gl_Position = clip;
    gl_PointSize = uSize * (0.55 + aRand.z * 0.9) / -mv.z;
    vMix = aRand.x;
    vSpark = step(0.965, aRand.y) + push * 1.5;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform vec3 uHighlight;
  varying float vMix;
  varying float vSpark;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 col = mix(uAccent, uHighlight, vMix);
    col = mix(col, vec3(1.0, 0.95, 0.9), clamp(vSpark, 0.0, 1.0));
    gl_FragColor = vec4(col, soft * uOpacity);
  }
`

export interface ParticleScene {
  /** One target per section, in page order (changes when the layout switches between desktop and mobile). */
  setTargets: (targets: SceneTarget[]) => void
  /** Per section: how far (in CSS pixels) it has scrolled away from its home position (used without animation). */
  setAnchors: (offsetsPx: number[]) => void
  setMouse: (x: number, y: number, active: boolean) => void
  setRunning: (running: boolean) => void
  dispose: () => void
}

interface Layer {
  points: Points
  material: ShaderMaterial
  target: SceneTarget
  opacity: number
  anchor: number
}

export function createParticleScene(
  container: HTMLElement,
  opts: {
    count: number
    animate: boolean
    targets: SceneTarget[]
    /** Called once per animation frame right before rendering: returns the offsets for setAnchors. */
    anchors: () => number[]
  },
): ParticleScene {
  const renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 860 ? 1.5 : 2)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const camera = new PerspectiveCamera(42, 1, 0.1, 50)
  camera.position.set(0, 0, 7)
  const halfHeight = camera.position.z * Math.tan((camera.fov * Math.PI) / 360)

  const n = opts.count
  const randoms = new Float32Array(n * 3)
  for (let i = 0; i < n * 3; i++) randoms[i] = rand(i + 0.5)
  const randomAttr = new BufferAttribute(randoms, 3)

  // The theme's accent and highlight (CSS --accent-rgb / --amber-rgb) colour the points.
  const css = getComputedStyle(document.documentElement)
  const rgb = (name: string, fallback: [number, number, number]) => {
    const parts = css.getPropertyValue(name).trim().split(/\s+/).map(Number)
    const [r, g, b] = parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? parts : fallback
    return new Vector3(r! / 255, g! / 255, b! / 255)
  }

  // Uniforms every layer shares by reference; only the opacity is per layer.
  const shared = {
    uAccent: { value: rgb('--accent-rgb', [77, 159, 255]) },
    uHighlight: { value: rgb('--amber-rgb', [159, 208, 255]) },
    uTime: { value: 0 },
    uSize: { value: 42 * dpr },
    uMouse: { value: new Vector2(9, 9) },
    uMouseForce: { value: 0 },
    uAspect: { value: 1 },
  }

  const layers: Layer[] = opts.targets.map((target) => {
    const geometry = new BufferGeometry()
    const data = new Float32Array(n * 3)
    const gen = generators[target.shape % generators.length]!
    for (let i = 0; i < n; i++) gen(i, n, data)
    geometry.setAttribute('position', new BufferAttribute(data, 3))
    geometry.setAttribute('aRand', randomAttr)
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...shared, uOpacity: { value: 0 } },
    })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    points.visible = false
    scene.add(points)
    return { points, material, target, opacity: 0, anchor: 0 }
  })

  const mouse = { x: 9, y: 9, force: 0, active: false }
  const worldPerPixel = () => (2 * halfHeight) / Math.max(container.clientHeight, 1)
  let running = true
  let frame = 0
  let last = performance.now()
  let time = 0

  function resize() {
    const { clientWidth: w, clientHeight: h } = container
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    shared.uAspect.value = w / h
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  function step(dt: number, snap = false) {
    const k = snap ? 1 : 1 - Math.pow(0.0015, dt)
    mouse.force += ((mouse.active ? 1 : 0) - mouse.force) * k
    shared.uMouse.value.set(mouse.x, mouse.y)
    shared.uMouseForce.value = mouse.force
    for (const layer of layers) {
      const { points, target } = layer
      const y = target.y + layer.anchor
      // Only shapes near the screen are drawn; the others wait at their spot.
      points.visible = Math.abs(y) < halfHeight + 2.6 * target.scale
      if (!points.visible) continue
      layer.opacity += (target.opacity - layer.opacity) * k
      if (target.follow) {
        // Same rotation as the globe of words (its screen y points down, world y up).
        points.rotation.y = target.follow.y
        points.rotation.x = target.tilt - target.follow.x
      } else {
        if (target.spin > 0) points.rotation.y += dt * target.spin
        points.rotation.x = target.tilt
      }
      points.position.set(target.x, y, 0)
      points.scale.setScalar(target.scale)
      layer.material.uniforms.uOpacity!.value = layer.opacity
    }
  }

  function applyAnchors(offsetsPx: number[]) {
    // Screen y grows downwards, world y upwards. Each shape sticks to its section 1:1.
    const unit = worldPerPixel()
    offsetsPx.forEach((offset, i) => {
      if (layers[i]) layers[i].anchor = -offset * unit
    })
  }

  function renderOnce() {
    step(0, true)
    renderer.render(scene, camera)
  }

  function loop(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    time += dt
    shared.uTime.value = time
    // Read the scroll position in the same frame that is drawn, so shapes never lag behind their section.
    applyAnchors(opts.anchors())
    step(dt)
    renderer.render(scene, camera)
    frame = running ? requestAnimationFrame(loop) : 0
  }

  if (opts.animate) frame = requestAnimationFrame(loop)
  else renderOnce()

  return {
    setTargets(targets) {
      targets.forEach((target, i) => {
        if (layers[i]) layers[i].target = target
      })
      // Without animation the scene jumps to the new state and renders once.
      if (!opts.animate) renderOnce()
    },
    setAnchors(offsetsPx) {
      applyAnchors(offsetsPx)
      if (!opts.animate) renderOnce()
    },
    setMouse(x, y, active) {
      mouse.x = x
      mouse.y = y
      mouse.active = active
    },
    setRunning(next) {
      if (!opts.animate || next === running) return
      running = next
      if (running && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      for (const layer of layers) {
        layer.points.geometry.dispose()
        layer.material.dispose()
      }
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
