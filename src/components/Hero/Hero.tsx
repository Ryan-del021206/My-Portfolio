import { ArrowRight } from 'lucide-react'
import { useRef, type CSSProperties } from 'react'
import { useI18n } from '../../i18n/useI18n'
import buttons from '../ui/buttons.module.css'
import { Greeting } from './Greeting'
import styles from './Hero.module.css'
import { SoestClock } from './SoestClock'
import { SourceLens } from './SourceLens'

/*
  Hello, curious visitor.
  You are reading the real source of the section you just looked at.
  It was loaded lazily the moment you wanted to see it.
*/
export function Hero() {
  const { t } = useI18n()
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section ref={heroRef} id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <Greeting />
        <SoestClock />

        <h1 id="hero-title" className={styles.title}>
          {t.hero.titleLines.map((line, index) => (
            <span key={index} className={styles.line}>
              <span className={styles.lineInner} style={{ '--i': index } as CSSProperties}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div className={styles.intro}>
          <p className={styles.lead}>{t.hero.lead}</p>
          <div className={styles.ctas}>
            <a href="#contact" className={buttons.primary}>
              {t.hero.primaryCta}
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </a>
            <a href="#mono" className={buttons.text}>
              {t.hero.secondaryCta}
            </a>
          </div>
        </div>

        <SourceLens hostRef={heroRef} className={styles.lensArea} />

        <dl className={styles.facts}>
          {t.hero.facts.map((fact, index) => (
            <div key={index} className={styles.fact}>
              <dt>{fact.label}</dt>
              <dd data-live={index === t.hero.facts.length - 1 || undefined}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
