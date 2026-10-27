import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { site } from '../../content/site'
import { useI18n } from '../../i18n/useI18n'
import type { TerminalCommand } from '../../i18n/types'
import styles from './Terminal.module.css'

type Line = { kind: 'input' | 'output' | 'error'; text: string; mail?: boolean }

const aliases: Record<string, TerminalCommand | 'clear'> = {
  help: 'help',
  hilfe: 'help',
  '?': 'help',
  whoami: 'whoami',
  projects: 'projects',
  projekte: 'projects',
  ls: 'projects',
  mono: 'mono',
  stack: 'stack',
  languages: 'languages',
  sprachen: 'languages',
  contact: 'contact',
  kontakt: 'contact',
  time: 'time',
  zeit: 'time',
  date: 'time',
  hire: 'hire',
  'hire-ryan': 'hire',
  'sudo hire-ryan': 'hire',
  clear: 'clear',
  cls: 'clear',
}

const suggestions = ['whoami', 'projects', 'mono', 'languages', 'sudo hire-ryan']

const soestTime = () =>
  new Intl.DateTimeFormat('de-DE', { timeZone: site.timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date())

/** A small, real terminal: every answer comes from the same facts as the rest of the page. */
export function Terminal() {
  const { t } = useI18n()
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function run(raw: string) {
    const input = raw.trim()
    if (!input) return
    history.current = [input, ...history.current].slice(0, 30)
    historyIndex.current = -1
    const command = aliases[input.toLowerCase().replace(/\s+/g, ' ')]
    if (command === 'clear') {
      setLines([])
      return
    }
    const echo: Line = { kind: 'input', text: input }
    if (!command) {
      setLines((prev) => [...prev, echo, { kind: 'error', text: t.terminal.notFound(input) }])
      return
    }
    const output = command === 'time' ? [t.terminal.time(soestTime())] : t.terminal.output[command]
    const mail = command === 'contact' || command === 'hire'
    setLines((prev) => [
      ...prev,
      echo,
      ...output.map((text): Line => ({ kind: 'output', text })),
      ...(mail ? [{ kind: 'output' as const, text: t.terminal.hireAction, mail: true }] : []),
    ])
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    run(value)
    setValue('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const next = historyIndex.current + (event.key === 'ArrowUp' ? 1 : -1)
    if (next < -1 || next >= history.current.length) return
    historyIndex.current = next
    setValue(next === -1 ? '' : history.current[next]!)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h3 className={styles.heading}>{t.terminal.heading}</h3>
        <p className={styles.intro}>{t.terminal.intro}</p>
      </div>

      <div className={styles.window} onClick={() => inputRef.current?.focus()}>
        <div className={styles.bar}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.title}>{t.terminal.title}</span>
        </div>
        <div ref={outputRef} className={styles.output} role="log" aria-live="polite">
          <p className={styles.muted}>{t.terminal.welcome}</p>
          {lines.map((line, i) =>
            line.kind === 'input' ? (
              <p key={i}>
                <span className={styles.prompt} aria-hidden="true">
                  ❯{' '}
                </span>
                {line.text}
              </p>
            ) : line.mail ? (
              <p key={i}>
                <a className={styles.link} href={`mailto:${site.email}`}>
                  → {line.text}
                </a>
              </p>
            ) : line.text.includes('#mono') ? (
              <p key={i}>
                <a className={styles.link} href="#mono">
                  {line.text}
                </a>
              </p>
            ) : (
              <p key={i} className={line.kind === 'error' ? styles.error : undefined}>
                {line.text}
              </p>
            ),
          )}
        </div>
        <form className={styles.form} onSubmit={submit}>
          <label htmlFor="terminal-input" className="visually-hidden">
            {t.terminal.inputLabel}
          </label>
          <span className={styles.prompt} aria-hidden="true">
            ❯
          </span>
          <input
            ref={inputRef}
            id="terminal-input"
            className={styles.input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="help"
            enterKeyHint="send"
          />
        </form>
      </div>

      <div className={styles.suggestions} role="group" aria-label={t.terminal.suggestionsLabel}>
        {suggestions.map((command) => (
          <button key={command} type="button" className={styles.suggestion} onClick={() => run(command)}>
            {command}
          </button>
        ))}
      </div>
    </div>
  )
}
