import heroSource from '../Hero/Hero.tsx?raw'
import { highlight } from '../Hero/highlight'
import type { CardProjectId } from '../../i18n/types'
import { useI18n } from '../../i18n/useI18n'
import styles from './visuals.module.css'

/*
  Built from real project facts: the game tiles name real projects, the
  portfolio visual shows a real screenshot of this site and its real code.
*/

function GamesGrid() {
  const { t } = useI18n()
  return (
    <ul className={styles.games}>
      {t.projects.games.map((game, i) => (
        <li key={game.name} className={styles.game} data-main={i === 0 || undefined}>
          <span className={styles.gameKind}>{game.kind}</span>
          <strong className={styles.gameName}>{game.name}</strong>
          <span className={styles.gameTech}>{game.tech}</span>
        </li>
      ))}
    </ul>
  )
}

/** The first lines of the hero component, exactly as they are in the repository. */
const heroLines = highlight(heroSource).slice(0, 16)

function PortfolioLayers() {
  const { t } = useI18n()
  const v = t.projects.portfolioVisual
  return (
    <div className={styles.layers}>
      <div className={`${styles.pane} ${styles.rendered}`}>
        <span className={styles.paneLabel}>{v.rendered}</span>
        <img className={styles.shot} src="/portfolio/website.webp" alt="" width={960} height={600} loading="lazy" decoding="async" />
      </div>
      <div className={`${styles.pane} ${styles.source}`}>
        <span className={styles.paneLabel}>{v.source} · Hero.tsx</span>
        <pre className={styles.code}>
          {heroLines.map((line, i) => (
            <span key={i} className={styles.codeLine}>
              {line.map((token, j) => (
                <span key={j} className={styles[token.type]}>
                  {token.text}
                </span>
              ))}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}

export function ProjectVisual({ id }: { id: CardProjectId }) {
  return id === 'omikron' ? <GamesGrid /> : <PortfolioLayers />
}
