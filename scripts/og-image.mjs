/**
 * Renders public/og-de.png and public/og-en.png (1200×630) with headless Chrome.
 * Uses the self-hosted fonts from node_modules, so no network access is needed.
 * Set CHROME_PATH if Chrome is not in the default Windows location.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const chrome =
  process.env.CHROME_PATH ??
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)
if (!chrome) throw new Error('Chrome not found – set CHROME_PATH.')

const font = (pkg, file) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href

const variants = {
  de: { title: ['Neugier,', 'kompiliert.'], line: 'IT & Entwicklung aus Soest' },
  en: { title: ['Curiosity,', 'compiled.'], line: 'IT & development from Soest, Germany' },
}

const page = ({ title, line }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Mona; src: url(${font('mona-sans', 'mona-sans-latin-wdth-normal.woff2')}) format('woff2'); font-weight: 200 900; font-stretch: 75% 125%; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body { background: #08080a; color: #eef2f8; font-family: Mona, sans-serif; padding: 72px 80px; position: relative; overflow: hidden;
  background-image: radial-gradient(circle at 88% 45%, rgb(77 159 255 / .28), transparent 38%), radial-gradient(rgb(190 215 255 / .07) 1.4px, transparent 1.4px); background-size: auto, 28px 28px; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 720; font-stretch: 112%; letter-spacing: -.02em; }
h1 { margin-top: 70px; font-size: 128px; font-weight: 720; font-stretch: 116%; line-height: .92; letter-spacing: -.035em; }
h1 span:last-child { color: #4d9fff; display: block; }
p { position: absolute; left: 80px; bottom: 64px; font-size: 30px; font-weight: 520; color: #b0b8c4; }
.ramp { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; display: flex; }
.ramp i { flex: 1; }
</style></head><body>
<div class="brand"><svg width="36" height="36" viewBox="0 0 20 20"><rect x="1" y="3" width="13" height="3" rx="1.5" fill="#9FD0FF"/><rect x="1" y="8.5" width="9" height="3" rx="1.5" fill="#6FB2FF"/><rect x="1" y="14" width="15" height="3" rx="1.5" fill="#4D9FFF"/><rect x="16.5" y="2" width="2.5" height="7" rx="1" fill="#EEF2F8"/></svg>Ryan</div>
<h1><span>${title[0]}</span><span>${title[1]}</span></h1>
<p>${line}</p>
<div class="ramp"><i style="background:linear-gradient(90deg,#9FD0FF,#4D9FFF)"></i></div>
</body></html>`

const dir = await mkdtemp(join(tmpdir(), 'og-'))
try {
  for (const [locale, copy] of Object.entries(variants)) {
    const html = join(dir, `${locale}.html`)
    await writeFile(html, page(copy))
    const out = join(root, 'public', `og-${locale}.png`)
    execFileSync(chrome, [
      '--headless=new',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=3000',
      `--user-data-dir=${join(dir, 'profile')}`,
      `--screenshot=${out}`,
      pathToFileURL(html).href,
    ])
    console.log(`wrote public/og-${locale}.png`)
  }
} finally {
  await rm(dir, { recursive: true, force: true })
}
