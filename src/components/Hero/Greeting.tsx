import { useEffect, useState } from 'react'
import { greetings } from '../../content/site'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import { useI18n } from '../../i18n/useI18n'
import styles from './Hero.module.css'

/** "Hallo / Hello, ich bin Ryan." – the two languages Ryan speaks. */
export function Greeting() {
  const { t, locale } = useI18n()
  const start = Math.max(0, greetings.findIndex((g) => g.lang === locale))
  const [index, setIndex] = useState(start)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % greetings.length), 2400)
    return () => window.clearInterval(timer)
  }, [])

  const word = greetings[index]!
  const own = greetings[start]!

  return (
    <p className={styles.kicker}>
      <img className={styles.avatar} src="/ryan.png" alt="" width={128} height={128} />
      <span className="visually-hidden">
        {own.text}
        {t.hero.greetingSuffix}
      </span>
      <span aria-hidden="true" className={styles.greeting} title={t.hero.greetingLabel}>
        <span key={word.lang} lang={word.lang} className={styles.greetingWord}>
          {word.text}
        </span>
        {t.hero.greetingSuffix}
      </span>
    </p>
  )
}
