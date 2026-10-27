import { projects, type Project } from '../../content/projects'
import type { CardProjectId } from '../../i18n/types'
import { useI18n } from '../../i18n/useI18n'
import { ProjectCard } from './ProjectCard'
import styles from './Projects.module.css'

export function Projects() {
  const { t } = useI18n()

  return (
    <section id="projects" className={`section ${styles.projects}`} aria-labelledby="projects-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="projects-title" className={styles.heading}>
            {t.projects.heading}
          </h2>
          <p className={styles.intro}>{t.projects.intro}</p>
        </div>
        <div className={styles.list}>
          {projects
            .filter((project) => project.id !== 'mono')
            .map((project) => (
              <ProjectCard key={project.id} project={project as Project & { id: CardProjectId }} />
            ))}
        </div>
      </div>
    </section>
  )
}
