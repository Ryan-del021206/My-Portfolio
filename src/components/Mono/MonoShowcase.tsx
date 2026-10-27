import { ArrowRight, Globe, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { monoScreens, projects } from '../../content/projects'
import { prefersReducedMotion } from '../../hooks/viewTransition'
import { demoPath } from '../../i18n/locale'
import { useI18n } from '../../i18n/useI18n'
import buttons from '../ui/buttons.module.css'
import type { PhoneScene } from '../../three/phoneScene'
import { CountUp } from '../ui/CountUp'
import styles from './MonoShowcase.module.css'

const screenUrl = (id: string) => `/mono/${id}.webp`
const mono = projects.find((p) => p.id === 'mono')!

export function MonoShowcase() {
  const { t, locale } = useI18n()
  const [screen, setScreen] = useState(0)
  const [userPicked, setUserPicked] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<PhoneScene | null>(null)
  const screenRef = useRef(screen)

  // Load the 3D phone shortly before the section scrolls into view.
  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const container = canvasRef.current
    if (!section || !stage || !container) return
    let disposed = false
    const reduced = prefersReducedMotion()
    let visible = false

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !visible) return
      const rect = stage.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
      sceneRef.current?.setPointer(Math.max(-1.5, Math.min(1.5, x)), Math.max(-1.5, Math.min(1.5, y)))
    }
    const onScroll = () => {
      if (!visible) return
      const rect = section.getBoundingClientRect()
      const p = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height)
      sceneRef.current?.setProgress(Math.max(0, Math.min(1, p)))
    }

    const load = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return
        load.disconnect()
        try {
          const { createPhoneScene } = await import('../../three/phoneScene')
          if (disposed) return
          const scene = await createPhoneScene(container, monoScreens.map(screenUrl), { animate: !reduced, initial: screenRef.current })
          if (disposed) return scene.dispose()
          sceneRef.current = scene
          onScroll()
          stage.dataset.ready = 'true'
        } catch (error) {
          // No WebGL: the screenshot in the CSS frame stays.
          console.warn('MONO 3D phone unavailable', error)
        }
      },
      { rootMargin: '600px 0px' },
    )
    load.observe(section)

    const view = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      sceneRef.current?.setRunning(visible)
    })
    view.observe(section)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      disposed = true
      load.disconnect()
      view.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      sceneRef.current?.dispose()
      sceneRef.current = null
      delete stage.dataset.ready
    }
  }, [])

  useEffect(() => {
    screenRef.current = screen
    sceneRef.current?.showScreen(screen)
  }, [screen])

  // Cycle through the screens while nobody has picked one.
  useEffect(() => {
    if (userPicked || prefersReducedMotion()) return
    const section = sectionRef.current
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer)
      if (entry?.isIntersecting) timer = window.setInterval(() => setScreen((s) => (s + 1) % monoScreens.length), 4200)
    })
    if (section) observer.observe(section)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [userPicked])

  const current = monoScreens[screen]!

  return (
    <section ref={sectionRef} id="mono" className={`section ${styles.mono}`} aria-labelledby="mono-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <img src="/mono/icon.svg" alt="" width={28} height={28} />
            {t.mono.eyebrow}
          </p>
          <h2 id="mono-title" className={styles.title}>
            MONO
          </h2>
          <p className={styles.tagline}>{t.mono.tagline}</p>
          <div className={styles.meta}>
            <span className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              {t.mono.status}
            </span>
            {t.mono.platforms.map((platform, i) => (
              <span key={platform} className={styles.platform}>
                {i === 0 ? <Smartphone size={16} aria-hidden="true" /> : <Globe size={16} aria-hidden="true" />}
                {platform}
              </span>
            ))}
          </div>
          <p className={styles.summary}>{t.mono.summary}</p>

          <dl className={styles.highlights}>
            {t.mono.highlights.map((h) => (
              <div key={h.label} className={styles.highlight}>
                <dt>{h.label}</dt>
                <dd>
                  <CountUp value={h.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.stageWrap}>
          <div ref={stageRef} className={styles.stage}>
            <div className={styles.fallback}>
              <img src={screenUrl(current)} alt={t.mono.screens[current].alt} width={540} height={1200} loading="lazy" decoding="async" />
            </div>
            <div ref={canvasRef} className={styles.canvas} />
          </div>
          <div className={styles.tabs} role="group" aria-label={t.mono.screensLabel}>
            {monoScreens.map((id, i) => (
              <button
                key={id}
                type="button"
                className={styles.tab}
                aria-pressed={i === screen}
                onClick={() => {
                  setUserPicked(true)
                  setScreen(i)
                }}
              >
                {t.mono.screens[id].label}
              </button>
            ))}
          </div>
          <p className={styles.note}>
            {t.mono.sourceNote} <span className={styles.drag}>{t.mono.dragHint}</span>
          </p>
        </div>

        <div className={styles.details}>
          <div>
            <h3 className={styles.detailHeading}>{t.mono.featuresLabel}</h3>
            <ul className={styles.bullets}>
              {t.mono.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={styles.detailHeading}>{t.mono.decisionsLabel}</h3>
            <ul className={styles.bullets}>
              {t.mono.decisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className={styles.footerRow}>
            <h3 className="visually-hidden">{t.mono.techLabel}</h3>
            <ul className={styles.tech}>
              {mono.tech.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            <p className={styles.availability}>{t.mono.availability}</p>
            <a href={demoPath(locale)} className={`${buttons.primary} ${styles.tryCta}`}>
              {t.mono.tryCta}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
