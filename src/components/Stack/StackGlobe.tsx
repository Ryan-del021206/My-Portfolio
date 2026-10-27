import { useEffect, useRef } from 'react'
import type { Tech } from '../../content/stack'
import { stackRotation } from '../../hooks/stackRotation'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import styles from './Stack.module.css'

interface Props {
  items: Tech[]
  selectedId: string
  nameOf: (tech: Tech) => string
  focusLabel: string
  label: string
  hint: string
  onSelect: (id: string) => void
}

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
const points = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * 2.399963
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r }
  })

/**
 * Real buttons placed on a rotating sphere. Positions are projected in JS and
 * written as transforms (no React state per frame). Drag to spin; focusing a
 * button turns it to the front, so keyboard users can follow along.
 */
export function StackGlobe({ items, selectedId, nameOf, focusLabel, label, hint, onSelect }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const base = points(items.length)
    const reduced = prefersReducedMotion()
    const rot = { x: -0.25, y: 0 }
    const vel = { x: 0, y: reduced ? 0 : 0.0035 }
    let target: { x: number; y: number } | null = null
    let dragging: { x: number; y: number } | null = null
    let pressed: { x: number; y: number; id: number } | null = null
    let paused = false
    let visible = false
    let frame = 0

    const render = () => {
      // Shared with the particle orbits behind the globe.
      stackRotation.x = rot.x
      stackRotation.y = rot.y
      const radius = root.clientWidth * 0.38
      const cy = Math.cos(rot.y)
      const sy = Math.sin(rot.y)
      const cx = Math.cos(rot.x)
      const sx = Math.sin(rot.x)
      base.forEach((p, i) => {
        const button = buttonRefs.current[i]
        if (!button) return
        const x1 = p.x * cy + p.z * sy
        const z1 = -p.x * sy + p.z * cy
        const y2 = p.y * cx - z1 * sx
        const z2 = p.y * sx + z1 * cx
        const depth = (z2 + 1) / 2
        const scale = 0.62 + depth * 0.5
        button.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${scale})`
        // Depth is shown by scale; opacity never drops below 0.62 so every label keeps ~7:1 contrast.
        const selected = button.getAttribute('aria-pressed') === 'true'
        button.style.opacity = selected ? '1' : String(0.62 + depth * 0.38)
        button.style.zIndex = String(selected ? 101 : Math.round(depth * 100))
      })
    }

    const loop = () => {
      if (target) {
        rot.x += (target.x - rot.x) * 0.12
        rot.y += (target.y - rot.y) * 0.12
        if (Math.abs(target.x - rot.x) + Math.abs(target.y - rot.y) < 0.002) target = null
      } else if (!dragging) {
        rot.y += paused ? 0 : vel.y
        rot.x += paused ? 0 : vel.x
        vel.x *= 0.95
        if (!reduced) vel.y += (0.0035 - vel.y) * 0.02
      }
      render()
      frame = visible ? requestAnimationFrame(loop) : 0
    }
    const kick = () => {
      if (!frame && visible) frame = requestAnimationFrame(loop)
    }

    const onDown = (event: PointerEvent) => {
      pressed = { x: event.clientX, y: event.clientY, id: event.pointerId }
    }
    const onMove = (event: PointerEvent) => {
      // Only a real drag captures the pointer, so plain clicks still reach the buttons.
      if (pressed && !dragging && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 4) {
        dragging = { x: event.clientX, y: event.clientY }
        target = null
        root.setPointerCapture(pressed.id)
      }
      if (!dragging) return
      const dx = event.clientX - dragging.x
      const dy = event.clientY - dragging.y
      dragging = { x: event.clientX, y: event.clientY }
      rot.y += dx * 0.006
      rot.x = Math.max(-1.2, Math.min(1.2, rot.x + dy * 0.006))
      vel.y = dx * 0.006
      vel.x = dy * 0.002
      if (reduced) render()
    }
    const onUp = () => {
      pressed = null
      dragging = null
    }
    const onFocus = (event: FocusEvent) => {
      const index = buttonRefs.current.indexOf(event.target as HTMLButtonElement)
      const p = base[index]
      if (!p) return
      // Rotate so this point faces the viewer (z = 1), along the shortest way round.
      const ty = Math.atan2(-p.x, p.z)
      const turns = Math.round((rot.y - ty) / (Math.PI * 2))
      target = { x: Math.atan2(p.y, Math.hypot(p.x, p.z)), y: ty + turns * Math.PI * 2 }
      paused = true
      if (reduced) {
        rot.x = target.x
        rot.y = target.y
        target = null
        render()
      }
      kick()
    }
    const onEnter = () => (paused = true)
    const onLeave = () => (paused = root.contains(document.activeElement))

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      if (visible) kick()
    })
    observer.observe(root)
    const resize = new ResizeObserver(render)
    resize.observe(root)
    render()

    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerup', onUp)
    root.addEventListener('pointercancel', onUp)
    root.addEventListener('focusin', onFocus)
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('focusout', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointercancel', onUp)
      root.removeEventListener('focusin', onFocus)
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('focusout', onLeave)
    }
  }, [items])

  return (
    <div className={styles.globeWrap}>
      <div ref={rootRef} className={styles.globe} role="group" aria-label={label} data-particle-anchor>
        {items.map((tech, i) => (
          <button
            key={tech.id}
            ref={(el) => {
              buttonRefs.current[i] = el
            }}
            type="button"
            className={styles.globeItem}
            aria-pressed={tech.id === selectedId}
            data-focus={tech.focus || undefined}
            onClick={() => onSelect(tech.id)}
          >
            {nameOf(tech)}
            {tech.focus && <span className="visually-hidden">, {focusLabel}</span>}
          </button>
        ))}
      </div>
      <p className={styles.globeHint}>{hint}</p>
    </div>
  )
}
