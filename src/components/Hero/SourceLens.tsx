import { Code2, Layers } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import { useI18n } from '../../i18n/useI18n'
import { highlight, type Token } from './highlight'
import styles from './SourceLens.module.css'

const FOLLOW = 0.2

type Lines = { file: string; lines: Token[][] }[]

/** Loads this section's own source only when someone wants to see it. */
async function loadSource(): Promise<Lines> {
  const [hero, lens] = await Promise.all([import('./Hero.tsx?raw'), import('./SourceLens.tsx?raw')])
  return [
    { file: 'src/components/Hero/Hero.tsx', lines: highlight(hero.default) },
    { file: 'src/components/Hero/SourceLens.tsx', lines: highlight(lens.default) },
  ]
}

export function SourceLens({ hostRef, className }: { hostRef: RefObject<HTMLElement | null>; className?: string }) {
  const { t } = useI18n()
  const [source, setSource] = useState<Lines | null>(null)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const requested = useRef(false)

  const ensureSource = useCallback(() => {
    if (requested.current) return
    requested.current = true
    loadSource().then(setSource, () => {
      requested.current = false
    })
  }, [])

  // Desktop: the lens follows the mouse with a little easing. No React state per frame.
  useEffect(() => {
    const host = hostRef.current
    if (!host || prefersReducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    let target = { x: 0, y: 0 }
    let current = { x: 0, y: 0 }
    let inside = false

    const paint = () => {
      current = { x: current.x + (target.x - current.x) * FOLLOW, y: current.y + (target.y - current.y) * FOLLOW }
      host.style.setProperty('--lens-x', `${current.x}px`)
      host.style.setProperty('--lens-y', `${current.y}px`)
      const settled = Math.abs(target.x - current.x) < 0.3 && Math.abs(target.y - current.y) < 0.3
      frame = settled ? 0 : requestAnimationFrame(paint)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || host.dataset.lensOpen) return
      const rect = host.getBoundingClientRect()
      target = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      if (!inside) {
        inside = true
        current = target
        ensureSource()
      }
      // Never cover a control: the lens steps aside over links and buttons.
      const overControl = (event.target as Element).closest('a, button')
      host.toggleAttribute('data-lens-hover', !overControl)
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onLeave = () => {
      inside = false
      host.removeAttribute('data-lens-hover')
    }

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [hostRef, ensureSource])

  // Full reveal for touch and keyboard users; grows out of the button.
  const setRevealed = useCallback(
    (next: boolean) => {
      const host = hostRef.current
      const button = buttonRef.current
      if (!host || !button) return
      ensureSource()
      const hostRect = host.getBoundingClientRect()
      const rect = button.getBoundingClientRect()
      host.style.setProperty('--lens-x', `${rect.left + rect.width / 2 - hostRect.left}px`)
      host.style.setProperty('--lens-y', `${rect.top + rect.height / 2 - hostRect.top}px`)
      host.removeAttribute('data-lens-hover')
      if (next) host.dataset.lensOpen = 'true'
      else delete host.dataset.lensOpen
      setOpen(next)
    },
    [hostRef, ensureSource],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRevealed(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setRevealed])

  return (
    <>
      <div className={styles.layer} aria-hidden="true">
        {source && (
          <div className={styles.code}>
            {source.map(({ file, lines }) => (
              <div key={file} className={styles.file}>
                <p className={styles.fileName}>{file}</p>
                {lines.map((line, n) => (
                  <div key={n} className={styles.codeLine}>
                    <span className={styles.lineNo}>{n + 1}</span>
                    <span>
                      {line.map((token, i) => (
                        <span key={i} className={styles[token.type]}>
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <p className={styles.caption}>
          <Code2 size={16} strokeWidth={2} />
          {t.hero.lensCaption}
        </p>
      </div>
      <div className={styles.ring} aria-hidden="true" />

      <div className={`${styles.control} ${className ?? ''}`}>
        <button
          ref={buttonRef}
          type="button"
          className={styles.toggle}
          aria-pressed={open}
          onClick={() => setRevealed(!open)}
          onPointerEnter={ensureSource}
          onFocus={ensureSource}
        >
          {open ? <Layers size={18} strokeWidth={2} aria-hidden="true" /> : <Code2 size={18} strokeWidth={2} aria-hidden="true" />}
          {open ? t.hero.lensClose : t.hero.lensOpen}
        </button>
        <p className={styles.hint} aria-hidden="true">
          {t.hero.lensHint}
        </p>
      </div>
    </>
  )
}
