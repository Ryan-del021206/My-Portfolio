/**
 * Browser QA against a running preview (npm run build && npm run preview).
 *
 *   node scripts/qa.mjs [baseUrl] [outDir]
 *
 * Headless Chrome via the DevTools protocol, no extra dependencies. For every
 * viewport × language it checks: console errors, horizontal overflow,
 * text smaller than 12px, anchor offsets below the sticky header (target 20–40px)
 * and writes one screenshot per section into outDir.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '')
const outDir = resolve(process.argv[3] ?? 'qa-output')
const chrome =
  process.env.CHROME_PATH ??
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)
if (!chrome) throw new Error('Chrome not found – set CHROME_PATH.')

const viewports = [
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '1000', width: 1000, height: 800, mobile: false },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '360', width: 360, height: 740, mobile: true },
]
const sections = ['top', 'about', 'mono', 'projects', 'stack', 'process', 'contact']
const anchors = ['about', 'mono', 'projects', 'stack', 'process', 'contact']
const motion = process.env.QA_MOTION === '1'

const port = 9300 + Math.floor(Math.random() * 400)
const profile = await mkdtemp(join(tmpdir(), 'qa-chrome-'))
const proc = spawn(chrome, ['--headless=new', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], {
  stdio: 'ignore',
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200)
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl
  } catch {}
}
if (!wsUrl) throw new Error('Could not connect to Chrome')

const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
  } else if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    errors.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`)
  } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    errors.push(`log: ${msg.params.entry.text} ${msg.params.entry.url ?? ''}`)
  }
})
const send = (method, params = {}) =>
  new Promise((r, reject) => {
    const n = ++id
    pending.set(n, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : r(msg.result)))
    ws.send(JSON.stringify({ id: n, method, params }))
  })
const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')
await mkdir(outDir, { recursive: true })

const measure = `(async () => {
  await document.fonts.ready
  document.documentElement.style.scrollBehavior = 'auto'
  const header = document.querySelector('header')
  const small = [...document.querySelectorAll('body *')].filter((el) => {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    const style = getComputedStyle(el)
    return hasText && el.getClientRects().length && style.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]') && parseFloat(style.fontSize) < 12
  }).map((el) => el.tagName + ':' + el.textContent.trim().slice(0, 30))
  const offsets = {}
  for (const id of ${JSON.stringify(anchors)}) {
    location.hash = '#' + id
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const first = document.querySelector('#' + id + ' .container').firstElementChild
    offsets[id] = Math.round(first.getBoundingClientRect().top - header.getBoundingClientRect().bottom)
  }
  history.replaceState(null, '', location.pathname)
  scrollTo(0, 0)
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    small,
    offsets,
    lang: document.documentElement.lang,
    title: document.title,
    fonts: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))],
    h1: document.querySelectorAll('h1').length,
  }
})()`

const report = []
const configs = []
for (const vp of viewports) for (const locale of ['de', 'en']) configs.push({ vp, locale })

for (const { vp, locale } of configs) {
  errors.length = 0
  await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile })
  await send('Emulation.setTouchEmulationEnabled', { enabled: vp.mobile })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion ? 'no-preference' : 'reduce' }] })
  const script = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('locale', '${locale}') } catch {}`,
  })
  await send('Page.navigate', { url: `${base}${locale === 'en' ? '/en/' : '/'}` })
  await sleep(motion ? 3500 : 1500)
  const result = await evaluate(measure)
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: script.identifier })

  const tag = `${vp.name}-${locale}${motion ? '-motion' : ''}`
  {
    for (const section of sections) {
      await evaluate(`(() => { const el = document.getElementById('${section}'); scrollTo(0, section === 'top' ? 0 : el.getBoundingClientRect().top + scrollY - ${vp.mobile ? 64 : 72}); })()`.replace('section ===', `'${section}' ===`))
      await sleep(motion ? 1600 : 250)
      const shot = await send('Page.captureScreenshot', { format: 'png' })
      await writeFile(join(outDir, `${tag}-${section}.png`), Buffer.from(shot.data, 'base64'))
    }
  }
  report.push({ config: tag, ...result, errors: [...errors] })
  const bad = result.overflow > 0 || result.small.length || errors.length || Object.values(result.offsets).some((o) => o < 20 || o > 40)
  if (result.small.length) console.log('   small:', result.small.slice(0, 5).join(' | '))
  console.log(`${bad ? '✗' : '✓'} ${tag}  overflow=${result.overflow} small=${result.small.length} offsets=${JSON.stringify(result.offsets)} errors=${errors.length}`)
}

// Interactions, with real motion (view transitions, dialog) enabled.
const interactions = `(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const results = {}
  const root = document.documentElement
  const mobile = innerWidth < 860

  // Dark only: no theme switch, no light styles.
  results.darkOnly = getComputedStyle(root).colorScheme === 'dark' && !document.querySelector('[aria-label*="Design"], [aria-label*="theme"]')

  // Terminal: commands answer, unknown ones fail politely, clear empties the log.
  const input = document.getElementById('terminal-input')
  const setVal = (el, v) => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const log = document.querySelector('[role="log"]')
  setVal(input, 'whoami')
  input.form.requestSubmit()
  await wait(150)
  const typed = log.textContent.includes('Soest')
  setVal(input, 'rm -rf /')
  input.form.requestSubmit()
  await wait(150)
  const unknown = log.textContent.includes('rm -rf /')
  ;[...document.querySelectorAll('[role="group"] button')].find((b) => b.textContent === 'sudo hire-ryan').click()
  await wait(150)
  const hire = log.querySelector('a[href^="mailto:"]') !== null
  setVal(input, 'clear')
  input.form.requestSubmit()
  await wait(150)
  results.terminal = typed && unknown && hire && log.querySelectorAll('p').length === 1

  // MONO: picking a screen updates the pressed tab and the screenshot.
  const tabs = [...document.querySelectorAll('#mono [aria-pressed]')]
  tabs[2].click()
  await wait(200)
  results.monoTabs = tabs[2].getAttribute('aria-pressed') === 'true' && document.querySelector('#mono img[src*="library"]') !== null
  document.getElementById('mono').scrollIntoView()
  await wait(3000)
  results.monoPhone = document.querySelector('#mono [data-ready] canvas') !== null

  // Details of the first project open natively.
  const details = document.querySelector('#project-omikron details')
  details.querySelector('summary').click()
  await wait(400)
  results.details = details.open

  // Stack: selecting C# shows the honest "not shown yet" note, Java links to Omikron.
  const chip = (name) => [...document.querySelectorAll('#stack button')].find((b) => b.offsetParent && b.firstChild.textContent === name)
  chip('C#').click()
  await wait(100)
  results.stackEmpty = chip('C#').getAttribute('aria-pressed') === 'true' && !document.querySelector('#stack [href^="#project-"]')
  chip('Java').click()
  await wait(100)
  results.stackLink = document.querySelector('#stack [href="#project-omikron"]') !== null

  // Source lens: opens, Escape closes.
  const lens = [...document.querySelectorAll('#top button')].find((b) => b.hasAttribute('aria-pressed'))
  lens.click()
  // The source chunk loads lazily; poll instead of guessing a delay.
  for (let i = 0; i < 25 && !document.querySelector('#top [class*="codeLine"]'); i++) await wait(200)
  results.lensOpen = document.getElementById('top').hasAttribute('data-lens-open') && document.querySelector('#top [class*="codeLine"]') !== null
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await wait(300)
  results.lensClose = !document.getElementById('top').hasAttribute('data-lens-open') && lens.getAttribute('aria-pressed') === 'false'

  // Mobile menu: opens as modal, Escape closes, focus returns to the opener.
  if (mobile) {
    const opener = document.querySelector('header button[aria-haspopup="dialog"]')
    opener.click()
    await wait(400)
    const dialog = document.querySelector('header dialog')
    results.menuOpen = dialog.open && dialog.querySelectorAll('a[href^="#"]').length === 6
    dialog.close()
    await wait(300)
    results.menuFocus = document.activeElement === opener
  }

  // Language switch: URL, lang, title, and no German left on the English page.
  results.particles = document.querySelector('[data-ready] > canvas') !== null
  const startLang = root.lang
  document.querySelector('header a[hreflang="' + (startLang === 'de' ? 'en' : 'de') + '"]').click()
  await wait(900)
  const text = document.body.innerText
  results.language =
    root.lang !== startLang &&
    (root.lang === 'en' ? location.pathname === '/en/' : location.pathname === '/') &&
    document.title.includes(root.lang === 'en' ? 'from Soest' : 'aus Soest') &&
    localStorage.getItem('locale') === root.lang
  results.noGermanLeft = root.lang !== 'en' || !/\\b(Über mich|Projekte|Arbeitsweise|Schreib mir|Kontakt|Ziel|Funktionen)\\b/.test(text)
  history.back()
  await wait(900)
  results.backButton = root.lang === startLang
  return results
})()`

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
for (const vp of [viewports[0], viewports[2]]) {
  errors.length = 0
  await send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile })
  await send('Page.navigate', { url: `${base}/` })
  await sleep(3500)
  await evaluate(`localStorage.clear()`)
  const result = await evaluate(interactions)
  const failed = Object.entries(result).filter(([, ok]) => !ok).map(([name]) => name)
  report.push({ config: `interactions-${vp.name}`, ...result, errors: [...errors] })
  console.log(`${failed.length || errors.length ? '✗' : '✓'} interactions-${vp.name}  ${JSON.stringify(result)} errors=${JSON.stringify(errors)}`)
}

await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
ws.close()
proc.kill()
await sleep(300)
await rm(profile, { recursive: true, force: true }).catch(() => {})
console.log(`\nreport + screenshots: ${outDir}`)
