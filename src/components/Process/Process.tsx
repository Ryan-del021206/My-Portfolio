import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n/useI18n'
import styles from './Process.module.css'

export function Process() {
  const { t } = useI18n()

  return (
    <section id="process" className={`section ${styles.process}`} aria-labelledby="process-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="process-title" className={styles.heading}>
            {t.process.heading}
          </h2>
          <p className={styles.intro}>{t.process.intro}</p>
        </div>

        <ol className={styles.steps}>
          {t.process.steps.map((step, index) => (
            <li key={step.title} className={styles.step} style={{ '--i': index, '--c': `var(--step-${index + 1})` } as CSSProperties}>
              <span className={styles.segment} aria-hidden="true" />
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
              <p className={styles.result}>
                <span className={styles.resultLabel}>{t.process.resultLabel}</span>
                {step.result}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
