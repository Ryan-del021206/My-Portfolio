import { useEffect, useRef } from 'react'
import { stackRotation } from '../../hooks/stackRotation'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import type { ParticleScene, SceneTarget } from '../../three/particleScene'
import styles from './ParticleField.module.css'

/** One shape per section, in page order. Desktop places the shape where the layout leaves room. */
const sections: { id: string; desktop: SceneTarget; mobile: Partial<SceneTarget>; anchor?: string }[] = [
  // Hero: the planet sits in the free right half.
  { id: 'top', desktop: { shape: 0, x: 2.55, y: -0.15, scale: 0.92, opacity: 0.95, spin: 0.12, tilt: 0 }, mobile: { x: 0.4, y: 2.1, scale: 0.55, opacity: 0.32 } },
  // Text-heavy sections: shapes move to the edge and dim, so text stays readable.
  { id: 'about', desktop: { shape: 1, x: 4.2, y: 0, scale: 0.85, opacity: 0.18, spin: 0.3, tilt: 0.15 }, mobile: { x: 1.6, scale: 0.55, opacity: 0.16 } },
  // MONO: the particle logo frames the 3D phone.
  { id: 'mono', desktop: { shape: 2, x: 2.05, y: 0, scale: 1.25, opacity: 0.85, spin: 0, tilt: 0 }, mobile: { x: 0.6, y: 1.9, scale: 0.55, opacity: 0.2 } },
  { id: 'projects', desktop: { shape: 3, x: 2.7, y: 0, scale: 0.9, opacity: 0.3, spin: 0.15, tilt: 0.4 }, mobile: { x: 0, scale: 0.6, opacity: 0.16 } },
  // Stack: orbits centred on the globe of words and turning with it (position and size are measured).
  {
    id: 'stack',
    anchor: '#stack [data-particle-anchor]',
    desktop: { shape: 4, x: -1.75, y: -0.85, scale: 1.0, opacity: 0.55, spin: 0, tilt: 0, follow: stackRotation },
    mobile: { x: 0, y: 0, scale: 0.7, opacity: 0.18, spin: 0.18, tilt: 0.2, follow: undefined },
  },
  { id: 'process', desktop: { shape: 5, x: 0, y: -2.1, scale: 1.05, opacity: 0.3, spin: 0, tilt: 0.55 }, mobile: { x: 0, y: -2.2, scale: 0.6, opacity: 0.18 } },
  // Contact: the ring sits behind the opaque contact panel.
  { id: 'contact', desktop: { shape: 6, x: 2.35, y: -0.1, scale: 1.05, opacity: 0.6, spin: 0.1, tilt: 0.35 }, mobile: { x: 0, y: 1.4, scale: 0.6, opacity: 0.2 } },
]

/**
 * A fixed WebGL particle layer behind the whole page. three.js is loaded
 * only after the page is idle; without WebGL the page simply has no particles.
 */
export function ParticleField() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    let disposed = false
    let scene: ParticleScene | null = null
    let tops: number[] = []
    let header = 0
    // Shapes pinned to an element (the globe): its centre on the page and the fitted x/scale.
    let pinned: ({ centerY: number; x: number; scale: number } | null)[] = []
    let frame = 0
    const reduced = prefersReducedMotion()
    const mobile = () => window.innerWidth < 860

    // World units per CSS pixel: camera at z = 7 with a 42° field of view, canvas one screen tall.
    const unit = () => (2 * 7 * Math.tan((42 * Math.PI) / 360)) / Math.max(window.innerHeight, 1)

    const measure = () => {
      header = document.querySelector('header')?.offsetHeight ?? 0
      tops = sections.map(({ id }) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY
      })
      pinned = sections.map(({ anchor }) => {
        const el = anchor ? document.querySelector(anchor) : null
        const box = el?.getBoundingClientRect()
        if (!box || !box.width || mobile()) return null
        // The words sit on a sphere of 0.38 × width; the outer orbit (radius 2.1) circles just outside it.
        return {
          centerY: box.top + window.scrollY + box.height / 2,
          x: (box.left + box.width / 2 - window.innerWidth / 2) * unit(),
          scale: (box.width * 0.38 * 1.12 * unit()) / 2.1,
        }
      })
      scene?.setTargets(targets())
    }

    const targets = (): SceneTarget[] =>
      sections.map((s, i) => {
        const target = mobile() ? { ...s.desktop, ...s.mobile } : s.desktop
        const pin = pinned[i]
        return pin ? { ...target, x: pin.x, y: 0, scale: pin.scale } : target
      })

    // Every section owns its shape. It sits at a fixed spot inside the section
    // and scrolls with it – nothing flies or morphs between sections.
    // The canvas is not fixed to the screen: it lives in the page and is moved to
    // the scroll position it was drawn for. If the browser scrolls ahead of the
    // next frame, canvas and content still move together, so nothing wobbles.
    const anchors = () => {
      const scroll = window.scrollY
      container.style.transform = `translate3d(0, ${scroll}px, 0)`
      // Home position: the hero at the very top, every other section with its
      // top just below the sticky header (how the shapes were composed);
      // pinned shapes sit on their element's centre.
      return tops.map((top, i) => {
        const pin = pinned[i]
        if (pin) return pin.centerY - scroll - window.innerHeight / 2
        return top - scroll - (i === 0 ? 0 : header)
      })
    }
    let wasMobile = mobile()
    const update = () => {
      frame = 0
      if (!scene) return
      if (wasMobile !== mobile()) {
        wasMobile = mobile()
        measure()
      }
      if (reduced) scene.setAnchors(anchors())
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !scene) return
      scene.setMouse((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, true)
    }
    const onLeave = () => scene?.setMouse(9, 9, false)
    const onVisibility = () => scene?.setRunning(!document.hidden)
    const resizeObserver = new ResizeObserver(() => {
      measure()
      onScroll()
    })

    const start = async () => {
      try {
        const { createParticleScene } = await import('../../three/particleScene')
        if (disposed) return
        const cores = navigator.hardwareConcurrency ?? 8
        // Points per shape; only the one or two shapes near the screen are drawn.
        const count = mobile() ? 4000 : cores <= 4 ? 9000 : 16000
        measure()
        scene = createParticleScene(container, { count, animate: !reduced, targets: targets(), anchors })
        update()
        container.dataset.ready = 'true'
        window.addEventListener('scroll', onScroll, { passive: true })
        if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)
        document.addEventListener('visibilitychange', onVisibility)
        resizeObserver.observe(document.body)
      } catch (error) {
        // No WebGL or the chunk failed: the page works without particles.
        console.warn('Particle field unavailable', error)
      }
    }

    // Never compete with the first paint: wait for load, then for an idle moment.
    // Phones (where the field is only a faint background) wait for the first scroll or touch.
    let started = false
    const startOnce = () => {
      if (started) return
      started = true
      window.removeEventListener('scroll', startOnce)
      window.removeEventListener('pointerdown', startOnce)
      void start()
    }
    const idle = () => {
      if (mobile()) {
        window.addEventListener('scroll', startOnce, { passive: true, once: true })
        window.addEventListener('pointerdown', startOnce, { passive: true, once: true })
        window.setTimeout(startOnce, 3500)
        return
      }
      startDesktop()
    }
    const startDesktop = () =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(startOnce, { timeout: 1500 })
        : window.setTimeout(startOnce, 300)
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      started = true
      window.removeEventListener('load', idle)
      window.removeEventListener('scroll', startOnce)
      window.removeEventListener('pointerdown', startOnce)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      resizeObserver.disconnect()
      scene?.dispose()
    }
  }, [])

  return (
    <div className={styles.track} aria-hidden="true">
      <div ref={ref} className={styles.field} />
    </div>
  )
}
