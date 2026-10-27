import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
  A black phone built from generated geometry (no model download), lit by a
  room environment plus an ember rim light. The screen shows real MONO
  screenshots and cross-fades between them.
*/

const BODY = { w: 1.5, h: 3.16, r: 0.24, depth: 0.12 }
const SCREEN = { w: 1.35, h: 3.0, r: 0.17 }

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** ShapeGeometry UVs are in shape units; map them to 0..1 for the screenshot. */
function screenGeometry() {
  const geometry = new ShapeGeometry(roundedRect(SCREEN.w, SCREEN.h, SCREEN.r), 12)
  const pos = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / SCREEN.w + 0.5, pos.getY(i) / SCREEN.h + 0.5)
  return geometry
}

function shadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.65)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(canvas)
}

export interface PhoneScene {
  showScreen: (index: number) => void
  setPointer: (x: number, y: number) => void
  setProgress: (p: number) => void
  setRunning: (running: boolean) => void
  dispose: () => void
}

export async function createPhoneScene(
  container: HTMLElement,
  screens: string[],
  opts: { animate: boolean; initial: number },
): Promise<PhoneScene> {
  // Load every screenshot before the canvas appears, so no empty frame flashes.
  const loader = new TextureLoader()
  const textures: Texture[] = await Promise.all(screens.map((url) => loader.loadAsync(url)))

  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.domElement.setAttribute('aria-hidden', 'true')

  for (const texture of textures) {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  }

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envTarget.texture

  const camera = new PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0, 8.4)

  const phone = new Group()
  scene.add(phone)

  const bodyGeometry = new ExtrudeGeometry(roundedRect(BODY.w, BODY.h, BODY.r), {
    depth: BODY.depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 6,
    curveSegments: 24,
  })
  bodyGeometry.translate(0, 0, -BODY.depth / 2)
  const bodyMaterial = new MeshPhysicalMaterial({ color: 0x0e0e10, metalness: 0.75, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.2 })
  phone.add(new Mesh(bodyGeometry, bodyMaterial))

  const front = BODY.depth / 2 + 0.042
  const glass = new Mesh(new ShapeGeometry(roundedRect(BODY.w - 0.04, BODY.h - 0.04, BODY.r - 0.02), 12), new MeshBasicMaterial({ color: 0x000000 }))
  glass.position.z = front
  phone.add(glass)

  const screenGeo = screenGeometry()
  const screenA = new Mesh(screenGeo, new MeshBasicMaterial({ map: textures[opts.initial] ?? textures[0]!, toneMapped: false }))
  const screenB = new Mesh(screenGeo, new MeshBasicMaterial({ map: textures[0]!, toneMapped: false, transparent: true, opacity: 0 }))
  screenA.position.z = front + 0.002
  screenB.position.z = front + 0.004
  phone.add(screenA, screenB)

  const lens = new Mesh(new CircleGeometry(0.045, 24), new MeshBasicMaterial({ color: 0x050505 }))
  lens.position.set(0, SCREEN.h / 2 - 0.12, front + 0.006)
  phone.add(lens)

  const buttonMaterial = new MeshPhysicalMaterial({ color: 0x1a1a1d, metalness: 0.9, roughness: 0.3 })
  for (const [y, h] of [[0.75, 0.42], [0.2, 0.26]] as const) {
    const button = new Mesh(new BoxGeometry(0.04, h, 0.07), buttonMaterial)
    button.position.set(BODY.w / 2 + 0.05, y, 0)
    phone.add(button)
  }

  const shadow = new Mesh(new PlaneGeometry(2.6, 0.9), new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }))
  shadow.position.set(0, -BODY.h / 2 - 0.45, -0.3)
  shadow.rotation.x = -Math.PI / 2.4
  scene.add(shadow)

  const key = new DirectionalLight(0xffffff, 1.4)
  key.position.set(2, 3, 5)
  const rim = new DirectionalLight(0x4d9fff, 5)
  rim.position.set(-4, 1.5, -2.5)
  const rim2 = new DirectionalLight(0x9fd0ff, 2.5)
  rim2.position.set(4, -2, -3)
  scene.add(key, rim, rim2)

  container.appendChild(renderer.domElement)

  const pointer = { x: 0, y: 0 }
  const state = { rotX: 0, rotY: -0.5, progress: 0.5, fade: 1 }
  let current = opts.initial
  let running = true
  let frame = 0
  let last = performance.now()
  let time = 0

  function resize() {
    const { clientWidth: w, clientHeight: h } = container
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const observer = new ResizeObserver(() => {
    resize()
    if (!opts.animate) render()
  })
  observer.observe(container)
  resize()

  function render() {
    renderer.render(scene, camera)
  }

  function step(dt: number) {
    const k = 1 - Math.pow(0.004, dt)
    const targetY = (state.progress - 0.5) * 0.9 + pointer.x * 0.35
    const targetX = -pointer.y * 0.18 + 0.04
    state.rotY += (targetY - state.rotY) * k
    state.rotX += (targetX - state.rotX) * k
    phone.rotation.set(state.rotX, state.rotY, Math.sin(time * 0.6) * 0.02)
    phone.position.y = Math.sin(time * 0.9) * 0.06
    // Cross-fade: B shows the new screen, then becomes A.
    if (state.fade < 1) {
      state.fade = Math.min(1, state.fade + dt * 3.2)
      screenB.material.opacity = state.fade
      if (state.fade === 1) {
        screenA.material.map = screenB.material.map
        screenA.material.needsUpdate = true
        screenB.material.opacity = 0
      }
    }
  }

  function loop(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    time += dt
    step(dt)
    render()
    frame = running ? requestAnimationFrame(loop) : 0
  }

  if (opts.animate) frame = requestAnimationFrame(loop)
  else {
    state.rotY = 0
    phone.rotation.set(0.04, -0.18, 0)
    render()
  }

  return {
    showScreen(index) {
      if (index === current || !textures[index]) return
      current = index
      if (!opts.animate) {
        screenA.material.map = textures[index]!
        screenA.material.needsUpdate = true
        render()
        return
      }
      screenB.material.map = textures[index]!
      screenB.material.needsUpdate = true
      screenB.material.opacity = 0
      state.fade = 0
    },
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },
    setProgress(p) {
      state.progress = p
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
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose()
          const material = object.material as MeshBasicMaterial
          material.map?.dispose()
          material.dispose()
        }
      })
      textures.forEach((t) => t.dispose())
      envTarget.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
