import { useI18n } from '../../i18n/useI18n'
import styles from './Marquee.module.css'

/** Two counter-running bands of real facts. Decorative: the same facts appear in the text. */
export function Marquee() {
  const { t } = useI18n()
  const row = (items: string[]) =>
    [...items, ...items].map((item, i) => (
      <span key={i} className={styles.item}>
        {item}
        <span className={styles.star}>✦</span>
      </span>
    ))

  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={`${styles.band} ${styles.ember}`}>
        <div className={styles.track}>{row(t.marquee)}</div>
      </div>
      <div className={`${styles.band} ${styles.ghost}`}>
        <div className={`${styles.track} ${styles.reverse}`}>{row([...t.marquee].reverse())}</div>
      </div>
    </div>
  )
}
