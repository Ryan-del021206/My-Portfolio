import { ArrowUp } from 'lucide-react'
import { legalPaths } from '../../content/legal'
import { site } from '../../content/site'
import { useI18n } from '../../i18n/useI18n'
import { navSections } from '../Header/sections'
import { LanguageSwitch } from '../Header/LanguageSwitch'
import { Mark } from '../ui/Mark'
import styles from './Footer.module.css'

// Evaluated once per load: at build time for the pre-rendered page, again in the browser.
const year = new Date().getFullYear()

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>
            <Mark size={20} />
            <span>Ryan</span>
          </p>
          <p className={styles.tagline}>{t.footer.tagline}</p>
          <a href={`mailto:${site.email}`} className={styles.email}>
            {site.email}
          </a>
        </div>

        <nav aria-label={t.footer.navLabel}>
          <ul className={styles.links}>
            {navSections.map((id) => (
              <li key={id}>
                <a href={`#${id}`}>{t.nav[id]}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottom}>
          <p suppressHydrationWarning>{t.footer.rights(year)}</p>
          <p>{t.footer.builtWith}</p>
          <p className={styles.legal}>
            <a href={legalPaths.imprint}>{t.footer.imprint}</a>
            <a href={legalPaths.privacy}>{t.footer.privacy}</a>
          </p>
          <div className={styles.bottomActions}>
            <LanguageSwitch />
            <a href="#top" className={styles.top}>
              {t.footer.backToTop}
              <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
