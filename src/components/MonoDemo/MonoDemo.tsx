import { ArrowLeft, ArrowUpRight, Mail } from 'lucide-react'
import { site } from '../../content/site'
import { demoPath, otherLocale, pathForLocale } from '../../i18n/locale'
import { useI18n } from '../../i18n/useI18n'
import buttons from '../ui/buttons.module.css'
import styles from './MonoDemo.module.css'

/**
 * The built iPhone version of MONO (public/mono-app), without its service worker.
 * The file name is spelled out: the dev server answers a bare /mono-app/ with the portfolio itself.
 */
const APP_URL = '/mono-app/index.html'

/**
 * /mono-demo/: the real MONO web app running in a phone frame, plus a short
 * introduction of the person who built it.
 */
export function MonoDemo() {
  const { t, locale } = useI18n()
  const d = t.monoDemo
  const other = otherLocale(locale)

  return (
    <>
      <header className={styles.bar}>
        <div className={`container ${styles.barInner}`}>
          <a href={pathForLocale(locale)} className={styles.back}>
            <ArrowLeft size={18} aria-hidden="true" />
            {d.back}
          </a>
          <a href={demoPath(other)} className={styles.lang} hrefLang={other} lang={other}>
            {other.toUpperCase()}
          </a>
        </div>
      </header>

      <main id="main" className={styles.page}>
        <section className={`container ${styles.demo}`} aria-labelledby="demo-title">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{d.eyebrow}</p>
            <h1 id="demo-title" className={styles.heading}>
              {d.heading}
            </h1>
            <p className={styles.intro}>{d.intro}</p>

            <h2 className={styles.subheading}>{d.stepsHeading}</h2>
            <ol className={styles.steps}>
              {d.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className={styles.privacy}>{d.privacy}</p>
            <a href={APP_URL} className={buttons.ghost} target="_blank" rel="noopener">
              {d.openFull}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.phone}>
            <iframe className={styles.screen} src={APP_URL} title={d.frameTitle} loading="lazy" />
          </div>
        </section>

        <section className={`container ${styles.about}`} aria-labelledby="about-title">
          <img className={styles.avatar} src="/ryan.png" alt={t.avatarAlt} width={128} height={128} loading="lazy" />
          <div className={styles.aboutCopy}>
            <p className={styles.eyebrow}>{d.aboutEyebrow}</p>
            <h2 id="about-title" className={styles.aboutHeading}>
              {d.aboutHeading}
            </h2>
            {d.about.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
            <dl className={styles.facts}>
              {d.facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.actions}>
              <a href={`mailto:${site.email}`} className={buttons.primary}>
                <Mail size={18} aria-hidden="true" />
                {d.contactCta}
              </a>
              <a href={`${pathForLocale(locale)}#about`} className={buttons.text}>
                {d.homeCta}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
