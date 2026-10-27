import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import type { PageId } from './i18n/locale'
import type { Locale } from './i18n/types'

export { dictionaries } from './i18n/locale'
export { locales } from './i18n/types'

/** Used at build time only (scripts/prerender.mjs). */
export function render(locale: Locale, page: PageId = 'home'): string {
  return renderToString(
    <StrictMode>
      <App initialLocale={locale} page={page} />
    </StrictMode>,
  )
}
