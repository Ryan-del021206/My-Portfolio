import { useI18n } from '../../i18n/useI18n'
import styles from './Drive.module.css'

export function Drive() {
  const { t } = useI18n()

  return (
    <section className={`section ${styles.drive}`} aria-labelledby="drive-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="drive-title" className={styles.heading}>
          {t.drive.heading}
        </h2>
        <p className={styles.statement}>{t.drive.statement}</p>
        <div className={styles.body}>
          <p className={styles.text}>{t.drive.text}</p>
          <h3 className={styles.nowHeading}>{t.drive.nowHeading}</h3>
          <ul className={styles.now}>
            {t.drive.now.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
