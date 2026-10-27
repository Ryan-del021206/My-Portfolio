import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/viewTransition'

/**
 * Renders the final value (also in the pre-rendered HTML) and counts up to it
 * once, the first time it scrolls into view.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const match = /^(\d+)(.*)$/.exec(value)
    if (!el || !match || prefersReducedMotion()) return
    const end = Number(match[1])
    const suffix = match[2] ?? ''
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1200
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 4)
          el.textContent = `${Math.round(end * eased)}${suffix}`
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      el.textContent = value
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
