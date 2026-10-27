import styles from './Mark.module.css'

/** Brand mark: three lines of code with a blinking cursor – amber to ember. */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg className={styles.mark} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="1" y="3" width="13" height="3" rx="1.5" className={styles.line1} />
      <rect x="1" y="8.5" width="9" height="3" rx="1.5" className={styles.line2} />
      <rect x="1" y="14" width="15" height="3" rx="1.5" className={styles.line3} />
      <rect x="16.5" y="2" width="2.5" height="7" rx="1" className={styles.cursor} />
    </svg>
  )
}
