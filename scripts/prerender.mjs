/**
 * Pre-renders the German (/) and English (/en/) page into static HTML.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (dist-ssr).
 * Domain-dependent tags (canonical, hreflang, og:url, sitemap) are only written
 * when SITE_URL is set, e.g. `SITE_URL=https://example.com npm run build`.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const ssrDir = resolve(root, 'dist-ssr')
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '')

const { render, dictionaries, locales } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const template = await readFile(resolve(dist, 'index.html'), 'utf8')

const pages = ['home', 'mono']
const pathFor = (locale, page = 'home') => (locale === 'en' ? '/en/' : '/') + (page === 'mono' ? 'mono-demo/' : '')
const escape = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const absolute = (path) => (siteUrl ? siteUrl + path : path)

function head(locale, page) {
  const t = dictionaries[locale]
  const title = page === 'mono' ? t.monoDemo.metaTitle : t.meta.title
  const description = page === 'mono' ? t.monoDemo.metaDescription : t.meta.description
  const alternate = locales.find((l) => l !== locale)
  const image = absolute(`/og-${locale}.png`)
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ryan',
    jobTitle: locale === 'de' ? 'IT & Entwicklung' : 'IT & development',
    email: 'mailto:ryanxruppert@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Soest', addressCountry: 'DE' },
    knowsLanguage: ['de', 'en'],
    ...(siteUrl ? { url: siteUrl + pathFor(locale) } : {}),
  }

  const tags = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Ryan" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:locale" content="${t.meta.ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${dictionaries[alternate].meta.ogLocale}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(t.meta.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
  if (siteUrl) {
    tags.push(
      `<link rel="canonical" href="${siteUrl}${pathFor(locale, page)}" />`,
      `<meta property="og:url" content="${siteUrl}${pathFor(locale, page)}" />`,
      ...locales.map((l) => `<link rel="alternate" hreflang="${l}" href="${siteUrl}${pathFor(l, page)}" />`),
      `<link rel="alternate" hreflang="x-default" href="${siteUrl}${pathFor('de', page)}" />`,
    )
  }
  tags.push(`<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n    ')
}

for (const page of pages) {
  for (const locale of locales) {
    const html = template
      .replace('<html lang="de">', `<html lang="${locale}">`)
      .replace(/<!--head:start-->[\s\S]*?<!--head:end-->/, head(locale, page))
      .replace('<!--app-html-->', render(locale, page))
    const file = resolve(dist, `.${pathFor(locale, page)}index.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
    console.log(`prerendered ${pathFor(locale, page)} (${(html.length / 1024).toFixed(1)} kB)`)
  }
}

const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? ['', `Sitemap: ${siteUrl}/sitemap.xml`] : [])].join('\n')
await writeFile(resolve(dist, 'robots.txt'), robots + '\n')

if (siteUrl) {
  const urls = pages
    .flatMap((page) =>
      locales.map((locale) => {
        const links = locales
          .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}${pathFor(l, page)}"/>`)
          .join('\n')
        return `  <url>\n    <loc>${siteUrl}${pathFor(locale, page)}</loc>\n${links}\n  </url>`
      }),
    )
    .join('\n')
  await writeFile(
    resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  )
  console.log('wrote sitemap.xml')
} else {
  console.log('SITE_URL not set: skipped canonical, hreflang, og:url and sitemap.xml')
}

// Hash of the inline theme script, for a strict Content-Security-Policy.
const inline = template.match(/<script>([\s\S]*?)<\/script>/)
if (inline) {
  const hash = createHash('sha256').update(inline[1]).digest('base64')
  console.log(`CSP script hash: 'sha256-${hash}'`)
}

await rm(ssrDir, { recursive: true, force: true })
