import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from '../src/App'

/** Same render path as the build-time pre-rendering. */
function page(locale: 'de' | 'en') {
  const container = document.createElement('div')
  container.innerHTML = renderToString(<App initialLocale={locale} />)
  return container
}

describe('pre-rendered page', () => {
  it.each(['de', 'en'] as const)('%s: every in-page link has a target', (locale) => {
    const root = page(locale)
    const targets = [...root.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')!.slice(1))
    expect(targets.length).toBeGreaterThan(10)
    for (const id of new Set(targets)) expect(root.querySelector(`#${CSS.escape(id)}`), `#${id}`).not.toBeNull()
  })

  it.each(['de', 'en'] as const)('%s: one h1 and no skipped heading levels', (locale) => {
    const root = page(locale)
    const levels = [...root.querySelectorAll('h1, h2, h3, h4')].map((h) => Number(h.tagName[1]))
    expect(levels.filter((l) => l === 1)).toHaveLength(1)
    levels.reduce((previous, level) => {
      expect(level - previous).toBeLessThanOrEqual(1)
      return level
    })
  })

  it.each(['de', 'en'] as const)('%s: buttons and links all have an accessible name', (locale) => {
    const root = page(locale)
    for (const el of root.querySelectorAll('a, button')) {
      const name = el.getAttribute('aria-label') ?? el.textContent?.trim()
      expect(name, el.outerHTML.slice(0, 80)).toBeTruthy()
    }
  })

  it('English page contains no German interface text', () => {
    const text = page('en').textContent ?? ''
    for (const word of ['Über mich', 'Projekte', 'Arbeitsweise', 'Schreib mir', 'Kontakt', 'In Entwicklung', 'Ziel']) {
      expect(text).not.toContain(word)
    }
  })

  it('contact uses a real mailto link and no fake Instagram URL while unverified', () => {
    const root = page('de')
    expect(root.querySelector('a[href^="mailto:ryanxruppert@gmail.com"]')).not.toBeNull()
    expect(root.querySelector('a[href*="instagram.com"]')).toBeNull()
    expect(root.textContent).toContain('@q0entin.ryan')
  })

  it('has no dead links', () => {
    const root = page('de')
    for (const a of root.querySelectorAll('a')) {
      const href = a.getAttribute('href')
      expect(href, a.outerHTML.slice(0, 80)).toMatch(/^(#.+|\/|\/en\/|mailto:|https:\/\/)/)
    }
  })
})
