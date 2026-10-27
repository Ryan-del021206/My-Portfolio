import type { ProjectStatus } from '../../content/projects'
import { useI18n } from '../../i18n/useI18n'
import styles from './Projects.module.css'

/** Shape and text carry the status, colour only supports it: ring, half, full. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useI18n()
  return (
    <span className={styles.status} data-status={status}>
      <span className={styles.statusDot} aria-hidden="true" />
      {t.projects.status[status]}
    </span>
  )
}
