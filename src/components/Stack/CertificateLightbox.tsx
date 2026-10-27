import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Certificate } from '../../content/certificates'
import styles from './CertificateLightbox.module.css'

interface Props {
  items: (Certificate & { image: string })[]
  /** Index of the open certificate; null when closed. */
  index: number | null
  onIndex: (index: number) => void
  onClose: () => void
  labels: { close: string; prev: string; next: string; alt: (name: string) => string; count: (n: number, total: number) => string }
}

/**
 * Full-size view of a certificate in a native <dialog>: the page behind is
 * blurred, X / Escape / a click outside closes it, arrows (buttons or keys) step through.
 */
export function CertificateLightbox({ items, index, onIndex, onClose, labels }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = index !== null
  const total = items.length

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onIndex((index + 1) % total)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + total) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, onIndex])

  const cert = index === null ? null : items[index]

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={cert?.name}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dark area (the dialog itself, not its content) closes it.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {cert && index !== null && (
        <div className={styles.stage}>
          <button type="button" className={`${styles.round} ${styles.close}`} onClick={onClose} aria-label={labels.close} autoFocus>
            <X size={22} aria-hidden="true" />
          </button>
          {total > 1 && (
            <button
              type="button"
              className={`${styles.round} ${styles.prev}`}
              onClick={() => onIndex((index - 1 + total) % total)}
              aria-label={labels.prev}
            >
              <ChevronLeft size={26} aria-hidden="true" />
            </button>
          )}
          <figure className={styles.figure}>
            <img className={styles.image} src={cert.image} alt={labels.alt(cert.name)} width={1200} height={914} />
            <figcaption className={styles.caption}>
              {cert.name} · {labels.count(index + 1, total)}
            </figcaption>
          </figure>
          {total > 1 && (
            <button
              type="button"
              className={`${styles.round} ${styles.next}`}
              onClick={() => onIndex((index + 1) % total)}
              aria-label={labels.next}
            >
              <ChevronRight size={26} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </dialog>
  )
}
