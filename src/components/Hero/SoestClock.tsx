import { useSyncExternalStore } from 'react'
import { site } from '../../content/site'
import { useI18n } from '../../i18n/useI18n'
import styles from './Hero.module.css'

const format = new Intl.DateTimeFormat('de-DE', { timeZone: site.timeZone, hour: '2-digit', minute: '2-digit' })

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 10_000)
  return () => window.clearInterval(timer)
}

const getTime = () => format.format(new Date())

/** Live local time in Soest. Empty in the pre-rendered HTML, filled in the browser. */
export function SoestClock() {
  const { t } = useI18n()
  const time = useSyncExternalStore(subscribe, getTime, () => '')
  const hour = Number(time.slice(0, 2))
  const night = time !== '' && hour < 5

  return (
    <p className={styles.clock} data-ready={time !== '' || undefined}>
      <span className={styles.clockDot} aria-hidden="true" />
      <span>
        {t.hero.clockLabel} <time className={styles.clockTime}>{time || '--:--'}</time>
      </span>
      {night && <span className={styles.night}>{t.hero.nightNote}</span>}
    </p>
  )
}
