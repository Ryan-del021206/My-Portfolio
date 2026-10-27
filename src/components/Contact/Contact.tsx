import { ArrowUpRight, Check, Copy, Mail, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { instagramUrl, site } from '../../content/site'
import { useI18n } from '../../i18n/useI18n'
import buttons from '../ui/buttons.module.css'
import { InstagramIcon } from '../ui/InstagramIcon'
import styles from './Contact.module.css'

type CopyState = 'idle' | 'copied' | 'failed'

export function Contact() {
  const { t } = useI18n()
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(t.contact.mailSubject)}`

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copyEmail() {
    window.clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(site.email)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    timer.current = window.setTimeout(() => setCopyState('idle'), 2400)
  }

  return (
    <section id="contact" className={`section ${styles.contact}`} aria-labelledby="contact-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <h2 id="contact-title" className={styles.heading}>
            {t.contact.heading}
          </h2>
          <p className={styles.text}>{t.contact.text}</p>
          <p className={styles.pricing}>{t.contact.pricing}</p>
        </div>

        <div className={styles.panel}>
          <p className={styles.label}>{t.contact.emailLabel}</p>
          <a href={mailto} className={styles.email}>
            {site.email}
          </a>
          <div className={styles.actions}>
            <a href={mailto} className={buttons.primary}>
              <Mail size={18} strokeWidth={2} aria-hidden="true" />
              {t.contact.emailCta}
            </a>
            <button type="button" className={buttons.ghost} onClick={copyEmail}>
              {copyState === 'copied' ? (
                <Check size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Copy size={16} strokeWidth={2} aria-hidden="true" />
              )}
              {copyState === 'copied' ? t.contact.copied : t.contact.copy}
            </button>
          </div>
          <p className={styles.status} role="status">
            {copyState === 'failed' ? t.contact.copyFailed : copyState === 'copied' ? t.contact.copied : ''}
          </p>

          <h3 className={styles.subheading}>{t.contact.checklistHeading}</h3>
          <ul className={styles.checklist}>
            {t.contact.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className={styles.subheading}>{t.contact.otherHeading}</h3>
          <ul className={styles.channels}>
            <li>
              <a href={site.phone.href} className={styles.channel}>
                <span className={styles.channelIcon}>
                  <Phone size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className={styles.channelText}>
                  <span className={styles.channelLabel}>{t.contact.phoneLabel}</span>
                  {site.phone.display}
                </span>
              </a>
            </li>
            {site.instagram.verified && (
              <li>
                <a href={instagramUrl} className={styles.channel} target="_blank" rel="noreferrer">
                  <span className={styles.channelIcon}>
                    <InstagramIcon size={20} />
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>{t.contact.instagramLabel}</span>
                    @{site.instagram.handle}
                  </span>
                  <ArrowUpRight className={styles.channelArrow} size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
