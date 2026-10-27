import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import styles from './CursorRing.module.css'

/**
 * An ember ring that trails the mouse and grows over anything clickable.
 * The real cursor stays visible; touch devices and reduced motion get nothing.
 */
export function CursorRing() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ref.current
    if (!ring || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const target = { x: -100, y: -100 }
    const pos = { x: -100, y: -100 }
    let frame = 0

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.2
      pos.y += (target.y - pos.y) * 0.2
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.2 ? requestAnimationFrame(loop) : 0
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      target.x = event.clientX
      target.y = event.clientY
      ring.dataset.visible = 'true'
      const hot = (event.target as Element).closest('a, button, input, summary, [role="button"]')
      if (hot) ring.dataset.hot = 'true'
      else delete ring.dataset.hot
      if (!frame) frame = requestAnimationFrame(loop)
    }
    const onLeave = () => delete ring.dataset.visible
    const onDown = () => (ring.dataset.down = 'true')
    const onUp = () => delete ring.dataset.down

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className={styles.ring} aria-hidden="true">
      <span />
    </div>
  )
}
