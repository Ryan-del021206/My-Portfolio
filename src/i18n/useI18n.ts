import { createContext, use } from 'react'
import type { Dictionary, Locale } from './types'

export interface I18nValue {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const value = use(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}
