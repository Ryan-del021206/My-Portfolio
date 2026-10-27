import { useI18n } from '../../i18n/useI18n'
import { Terminal } from '../Terminal/Terminal'
import { CountUp } from '../ui/CountUp'
import styles from './About.module.css'

export function About() {
  const { t, locale } = useI18n()

  return (
    <section id="about" className={`section ${styles.about}`} aria-labelledby="about-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="about-title" className={styles.heading}>
            {t.about.heading}
          </h2>
          <div className={styles.introBlock}>
            <figure className={styles.portrait}>
              <img src="/ryan.png" alt={t.avatarAlt} width={128} height={128} loading="lazy" decoding="async" />
            </figure>
            <p className={styles.intro}>{t.about.intro}</p>
          </div>
        </div>

        <ol className={styles.timeline}>
          {t.about.chapters.map((chapter) => (
            <li key={chapter.label} className={styles.chapter}>
              <p className={styles.label}>{chapter.label}</p>
              <h3 className={styles.title}>{chapter.title}</h3>
              <p className={styles.text}>{chapter.text}</p>
            </li>
          ))}
        </ol>

        <h3 className="visually-hidden">{t.about.statsHeading}</h3>
        <dl className={styles.stats}>
          {t.about.stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd>
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>

        {/* Keyed by language: a switch starts a fresh terminal session. */}
        <Terminal key={locale} />
      </div>
    </section>
  )
}
