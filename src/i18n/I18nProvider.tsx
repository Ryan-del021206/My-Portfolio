import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { legalMeta } from '../content/legal'
import { withViewTransition } from '../hooks/viewTransition'
import { dictionaries, localeFromPath, pathForLocale, storeLocale, type PageId } from './locale'
import type { Locale } from './types'
import { I18nContext } from './useI18n'

function syncDocument(locale: Locale, page: PageId) {
  const t = dictionaries[locale]
  document.documentElement.lang = locale
  const meta =
    page === 'mono'
      ? { title: t.monoDemo.metaTitle, description: t.monoDemo.metaDescription }
      : page === 'home'
        ? t.meta
        : legalMeta[page]
  document.title = meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', t.meta.ogLocale)
}

export function I18nProvider({
  initialLocale,
  page = 'home',
  children,
}: {
  initialLocale: Locale
  page?: PageId
  children: ReactNode
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  useEffect(() => {
    syncDocument(locale, page)
  }, [locale, page])

  // Back/forward between / and /en/ switches the language too.
  useEffect(() => {
    const onPop = () => setLocaleState(localeFromPath(location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const setLocale = useCallback(
    (next: Locale) => {
      storeLocale(next)
      if (next === locale) return
      withViewTransition('locale', () => {
        flushSync(() => setLocaleState(next))
        history.pushState(null, '', pathForLocale(next) + location.hash)
      })
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, t: dictionaries[locale], setLocale }), [locale, setLocale])

  return <I18nContext value={value}>{children}</I18nContext>
}
