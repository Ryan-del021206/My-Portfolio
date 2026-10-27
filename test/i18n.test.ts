import { describe, expect, it } from 'vitest'
import { de } from '../src/i18n/de'
import { en } from '../src/i18n/en'
import { localeFromPath, otherLocale, pathForLocale, preferredBrowserLocale } from '../src/i18n/locale'

type Shape = string | number | Shape[] | { [key: string]: Shape }

/** Reduces a dictionary to its structure: keys, array lengths and value types. */
function shape(value: unknown): Shape {
  if (Array.isArray(value)) return value.map(shape)
  if (typeof value === 'function') return 'fn'
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'techNames') // optional per-language overrides
        .map(([key, inner]) => [key, shape(inner)]),
    )
  }
  return typeof value
}

function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`))
  return []
}

describe('dictionaries', () => {
  it('German and English have exactly the same structure', () => {
    expect(shape(en)).toEqual(shape(de))
  })

  it('contain no empty strings or placeholder markers', () => {
    for (const dict of [de, en]) {
      for (const [path, text] of strings(dict)) {
        expect(text.trim(), path).not.toBe('')
        expect(text, path).not.toMatch(/TODO|lorem|placeholder/i)
        expect(text, path).not.toMatch(/\[[A-ZÄÖÜ ]{3,}\]/)
      }
    }
  })

  it('translate every visible string (identical text only for names and loanwords)', () => {
    // Numbers, tech names and code-like strings are the same in every language.
    const neutral = (path: string, text: string) =>
      /^[\d+]+$/.test(text) ||
      path.startsWith('.marquee') ||
      path.startsWith('.terminal.output.stack') ||
      // Project names and tech labels on the game tiles.
      path.startsWith('.projects.games')
    const allowedSame = new Set([
      '.nav.mono', '.hero.facts[2].value', '.terminal.title', '.terminal.output.help[7]', '.projects.names.mono',
      '.projects.names.omikron', '.stack.certIssuer',
      '.nav.stack', '.projects.items.omikron.name', '.projects.items.portfolio.kind', '.projects.fitnessModules[0]',
      '.projects.linksLabel', '.stack.groups.frontend', '.stack.groups.mobile', '.stack.groups.design', '.about.facts[0].label',
      '.about.facts[0].value', '.about.facts[1].value', '.contact.instagramLabel', '.terminal.output.contact[2]', '.a11y.menuTitle', '.hero.facts[3].label',
    ])
    const enStrings = new Map(strings(en))
    const same = strings(de)
      .filter(([path, text]) => enStrings.get(path) === text && !allowedSame.has(path) && !neutral(path, text))
      .map(([path]) => path)
    expect(same).toEqual([])
  })

  it('format functions work in both languages', () => {
    expect(de.footer.rights(2026)).toBe('© 2026 Ryan')
    expect(en.terminal.time('23:40')).toBe("It's 23:40 in Soest right now.")
    expect(de.terminal.notFound('ls -la')).toContain('ls -la')
  })
})

describe('locale helpers', () => {
  it('maps paths to languages', () => {
    expect(localeFromPath('/')).toBe('de')
    expect(localeFromPath('/en/')).toBe('en')
    expect(localeFromPath('/en')).toBe('en')
    expect(localeFromPath('/english')).toBe('de')
    expect(pathForLocale('en')).toBe('/en/')
    expect(pathForLocale('de')).toBe('/')
    expect(otherLocale('de')).toBe('en')
  })

  it('picks the first supported browser language', () => {
    expect(preferredBrowserLocale(['fr-FR', 'de-AT', 'en'])).toBe('de')
    expect(preferredBrowserLocale(['en-GB', 'de'])).toBe('en')
    expect(preferredBrowserLocale(['fr', 'es'])).toBeNull()
  })
})
