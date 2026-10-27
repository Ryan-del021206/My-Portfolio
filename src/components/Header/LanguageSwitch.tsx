import type { MouseEvent } from 'react'
import { dictionaries, pathForLocale } from '../../i18n/locale'
import { useI18n } from '../../i18n/useI18n'
import { locales, type Locale } from '../../i18n/types'
import styles from './LanguageSwitch.module.css'

/** Real links to / and /en/ (crawlable, work without JS); JS switches in place. */
export function LanguageSwitch({ onSwitch }: { onSwitch?: () => void }) {
  const { locale, t, setLocale } = useI18n()

  function choose(event: MouseEvent<HTMLAnchorElement>, next: Locale) {
    event.preventDefault()
    setLocale(next)
    onSwitch?.()
  }

  return (
    <div className={styles.switch} role="group" aria-label={t.a11y.languageSwitch}>
      {locales.map((code) => (
        <a
          key={code}
          href={pathForLocale(code)}
          hrefLang={code}
          lang={code}
          className={styles.option}
          aria-current={code === locale ? 'true' : undefined}
          onClick={(event) => choose(event, code)}
        >
          {code.toUpperCase()}
          {/* Accessible name "DE – Deutsch" keeps the visible label inside the name. */}
          <span className="visually-hidden"> – {dictionaries[code].language.current}</span>
        </a>
      ))}
    </div>
  )
}
