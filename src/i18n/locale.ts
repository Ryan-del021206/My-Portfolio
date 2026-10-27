import { de } from './de'
import { en } from './en'
import type { Dictionary, Locale } from './types'

export const dictionaries: Record<Locale, Dictionary> = { de, en }

export const defaultLocale: Locale = 'de'

const STORAGE_KEY = 'locale'
const HINT_KEY = 'locale-hint-dismissed'

/** `/en` and `/en/...` are English, everything else German. */
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : 'de'
}

export function pathForLocale(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/'
}

/** The MONO demo page in the given language. */
export function demoPath(locale: Locale): string {
  return locale === 'en' ? '/en/mono-demo/' : '/mono-demo/'
}

/** Which page a path shows: the portfolio or the MONO demo. */
export type PageId = 'home' | 'mono'

export function pageFromPath(pathname: string): PageId {
  return /\/mono-demo(\/|$)/.test(pathname) ? 'mono' : 'home'
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'de' ? 'en' : 'de'
}

/** First supported language in the browser's preference list, if any. */
export function preferredBrowserLocale(languages: readonly string[]): Locale | null {
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0]
    if (base === 'de' || base === 'en') return base
  }
  return null
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked (private mode, policy) – the choice simply isn't remembered.
  }
}

export function storedLocale(): Locale | null {
  const value = read(STORAGE_KEY)
  return value === 'de' || value === 'en' ? value : null
}

export const storeLocale = (locale: Locale) => write(STORAGE_KEY, locale)

export const hintDismissed = () => read(HINT_KEY) === '1'

export const dismissHint = () => write(HINT_KEY, '1')
