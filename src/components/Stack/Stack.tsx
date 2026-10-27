import { ArrowDownRight, ArrowUpRight, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { certificateFor, certificates } from '../../content/certificates'
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
  const certificate = certificateFor(selected.id)

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
          {certificate && (
            <a href={certificate.url} className={styles.certBadge} target="_blank" rel="noopener">
              <BadgeCheck size={18} aria-hidden="true" />
              {t.stack.certBadge}: {certificate.name}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>

        <div className={styles.certs}>
          <h3 className={styles.certsHeading}>{t.stack.certsHeading}</h3>
          <p className={styles.certsIntro}>{t.stack.certsIntro}</p>
          <ul className={styles.certList}>
            {certificates.map((cert) => (
              <li key={cert.id} className={styles.cert}>
                <BadgeCheck className={styles.certIcon} size={22} aria-hidden="true" />
                <strong className={styles.certName}>{cert.name}</strong>
                <span className={styles.certMeta}>
                  {t.stack.certIssuer} · {t.stack.certEarned}
                </span>
                <a href={cert.url} className={styles.certLink} target="_blank" rel="noopener">
                  {t.stack.certVerify}
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="visually-hidden">: {cert.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
