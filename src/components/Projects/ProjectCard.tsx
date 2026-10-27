import { ChevronDown, ExternalLink } from 'lucide-react'
import { projectAnchor, type Project } from '../../content/projects'
import type { CardProjectId } from '../../i18n/types'
import { useI18n } from '../../i18n/useI18n'
import styles from './Projects.module.css'
import { StatusBadge } from './StatusBadge'
import { ProjectVisual } from './visuals'

export function ProjectCard({ project }: { project: Project & { id: CardProjectId } }) {
  const { t } = useI18n()
  const copy = t.projects.items[project.id]
  const titleId = `${projectAnchor(project.id)}-title`
  const links = (['demo', 'repo'] as const).flatMap((kind) => {
    const href = project.links[kind]
    return href ? [{ kind, href }] : []
  })

  return (
    <article id={projectAnchor(project.id)} className={styles.card} aria-labelledby={titleId}>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span>{copy.kind}</span>
          <StatusBadge status={project.status} />
        </div>
        <h3 id={titleId} className={styles.name}>
          {copy.name}
        </h3>
        <p className={styles.summary}>{copy.summary}</p>

        <h4 className="visually-hidden">{t.projects.techLabel}</h4>
        <ul className={styles.tech}>
          {project.tech.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <details className={styles.details}>
          <summary className={styles.summaryButton}>
            {t.projects.detailsOpen}
            <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
          </summary>
          <div className={styles.detailGrid}>
            <div>
              <h4 className={styles.detailHeading}>{t.projects.goalLabel}</h4>
              <p>{copy.goal}</p>
            </div>
            <div>
              <h4 className={styles.detailHeading}>{t.projects.featuresLabel}</h4>
              <ul className={styles.bullets}>
                {copy.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={styles.detailHeading}>{t.projects.decisionsLabel}</h4>
              <ul className={styles.bullets}>
                {copy.decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        <p className={styles.availability}>
          {links.length > 0 ? (
            <>
              <span className="visually-hidden">{t.projects.linksLabel}: </span>
              {links.map(({ kind, href }) => (
                <a key={kind} href={href} className={styles.link} target="_blank" rel="noreferrer">
                  {t.projects.linkNames[kind]}
                  <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </>
          ) : (
            copy.availability
          )}
        </p>
      </div>

      <figure className={styles.visual}>
        <ProjectVisual id={project.id} />
        <figcaption className="visually-hidden">{t.projects.visualLabel[project.id]}</figcaption>
      </figure>
    </article>
  )
}
