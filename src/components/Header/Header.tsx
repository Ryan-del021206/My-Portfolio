import { Menu, X } from 'lucide-react'
import { useRef, type CSSProperties } from 'react'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useI18n } from '../../i18n/useI18n'
import buttons from '../ui/buttons.module.css'
import { Mark } from '../ui/Mark'
import styles from './Header.module.css'
import { LanguageSwitch } from './LanguageSwitch'
import { navSections } from './sections'

export function Header() {
  const { t } = useI18n()
  const active = useActiveSection(navSections)
  const menuRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)

  const closeMenu = () => menuRef.current?.close()

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.brand} aria-label={t.a11y.homeLink}>
          <Mark size={20} />
          <span className={styles.wordmark}>Ryan</span>
        </a>

        <nav className={styles.nav} aria-label={t.a11y.mainNav}>
          <ul className={styles.links}>
            {navSections
              .filter((id) => id !== 'contact')
              .map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className={styles.link} data-active={active === id || undefined}>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopOnly}>
            <LanguageSwitch />
          </div>
          <a href="#contact" className={`${buttons.compact} ${styles.desktopOnly}`}>
            {t.nav.cta}
          </a>
          <button
            ref={openerRef}
            type="button"
            className={styles.menuButton}
            aria-label={t.a11y.openMenu}
            aria-haspopup="dialog"
            onClick={() => menuRef.current?.showModal()}
          >
            <Menu size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={styles.progress} aria-hidden="true" />

      <dialog
        ref={menuRef}
        className={styles.menu}
        aria-label={t.a11y.menuTitle}
        onClick={(event) => {
          // Click on the backdrop area closes the menu.
          if (event.target === event.currentTarget) closeMenu()
        }}
        onClose={() => openerRef.current?.focus()}
      >
        <div className={styles.menuInner}>
          <div className={styles.menuTop}>
            <span className={styles.brand}>
              <Mark size={20} />
              <span className={styles.wordmark}>Ryan</span>
            </span>
            <button type="button" className={styles.menuButton} aria-label={t.a11y.closeMenu} onClick={closeMenu}>
              <X size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={t.a11y.mainNav}>
            <ul className={styles.menuLinks}>
              {navSections.map((id, index) => (
                <li key={id} style={{ '--i': index } as CSSProperties}>
                  <a href={`#${id}`} className={styles.menuLink} onClick={closeMenu}>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.menuFooter}>
            <LanguageSwitch onSwitch={closeMenu} />
          </div>
        </div>
      </dialog>
    </header>
  )
}
