import { X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { dictionaries, dismissHint, hintDismissed, preferredBrowserLocale, storedLocale } from '../../i18n/locale'
import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/types'
import styles from './LanguageHint.module.css'

const EVENT = 'localehint'
const notify = () => window.dispatchEvent(new Event(EVENT))

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

/** The browser's preferred language, unless the visitor already chose or dismissed. */
function getSuggestion(): Locale | null {
  if (hintDismissed() || storedLocale()) return null
  return preferredBrowserLocale(navigator.languages ?? [navigator.language])
}

/**
 * No automatic redirects (they confuse crawlers and shared links). Instead, a
 * visitor whose browser prefers the other language gets one quiet offer – in
 * that language – until they switch or dismiss it. Never part of the pre-render.
 */
export function LanguageHint() {
  const { locale, setLocale } = useI18n()
  const suggested = useSyncExternalStore(subscribe, getSuggestion, () => null)

  if (!suggested || suggested === locale) return null
  const copy = dictionaries[suggested].language

  return (
    <aside className={styles.hint} lang={suggested} aria-label={copy.current}>
      <p>{copy.hint}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.switch}
          onClick={() => {
            setLocale(suggested)
            notify()
          }}
        >
          {copy.hintAction}
        </button>
        <button
          type="button"
          className={styles.close}
          onClick={() => {
            dismissHint()
            notify()
          }}
          aria-label={copy.hintDismiss}
        >
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
