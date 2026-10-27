import { ArrowDownRight } from 'lucide-react'
import { useState } from 'react'
import { projectAnchor } from '../../content/projects'
import { allTech, groupOf, stack, type Tech } from '../../content/stack'
import { useI18n } from '../../i18n/useI18n'
import styles from './Stack.module.css'
import { StackGlobe } from './StackGlobe'

export function Stack() {
  const { t } = useI18n()
  const [selectedId, setSelectedId] = useState('kotlin')
  const selected = allTech.find((tech) => tech.id === selectedId) ?? allTech[0]!
  const nameOf = (tech: Tech) => t.stack.techNames[tech.id] ?? tech.name

  return (
    <section id="stack" className={`section ${styles.stack}`} aria-labelledby="stack-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="stack-title" className={styles.heading}>
            {t.stack.heading}
          </h2>
          <p className={styles.intro}>{t.stack.intro}</p>
        </div>

        {/* Desktop: the globe. Phones and reduced motion: the grouped list. */}
        <div className={styles.globeArea}>
          <StackGlobe
            items={allTech}
            selectedId={selected.id}
            nameOf={nameOf}
            focusLabel={t.stack.focusLabel}
            label={t.stack.globeLabel}
            hint={t.stack.globeHint}
            onSelect={setSelectedId}
          />
        </div>

        <div className={styles.listArea}>
          <p className={styles.legend}>
            <span className={styles.focusDot} aria-hidden="true" />
            {t.stack.focusLegend}
          </p>
          <dl className={styles.groups}>
            {stack.map((group) => (
              <div key={group.id} className={styles.group}>
                <dt className={styles.groupName}>{t.stack.groups[group.id]}</dt>
                <dd className={styles.items}>
                  {group.items.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      className={styles.chip}
                      aria-pressed={tech.id === selected.id}
                      data-focus={tech.focus || undefined}
                      onClick={() => setSelectedId(tech.id)}
                    >
                      {nameOf(tech)}
                      {tech.focus && (
                        <>
                          <span className={styles.focusDot} aria-hidden="true" />
                          <span className="visually-hidden">, {t.stack.focusLabel}</span>
                        </>
                      )}
                    </button>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.detail} aria-live="polite">
          <p className={styles.detailGroup}>{t.stack.groups[groupOf(selected.id)]}</p>
          <p className={styles.detailTitle}>
            {t.stack.detailTitle(nameOf(selected))}
            {selected.focus && <span className={styles.focusBadge}>{t.stack.focusLabel}</span>}
          </p>
          {selected.usedIn.length > 0 ? (
            <>
              <p className={styles.detailLabel}>{t.stack.usedInLabel}</p>
              <ul className={styles.usedIn}>
                {selected.usedIn.map((id) => (
                  <li key={id}>
                    <a href={`#${projectAnchor(id)}`} className={styles.projectLink}>
                      {t.projects.names[id]}
                      <ArrowDownRight size={18} strokeWidth={2} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.notYet}>{t.stack.notShownYet}</p>
          )}
        </div>
      </div>
    </section>
  )
}
