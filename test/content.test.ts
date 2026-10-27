import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import heroSource from '../src/components/Hero/Hero.tsx?raw'
import { highlight } from '../src/components/Hero/highlight'
import { monoScreens, projects } from '../src/content/projects'
import { allTech } from '../src/content/stack'
import { de } from '../src/i18n/de'
import { en } from '../src/i18n/en'

describe('content integrity', () => {
  it('every technology points only at projects that exist', () => {
    const ids = new Set(projects.map((p) => p.id))
    for (const tech of allTech) for (const id of tech.usedIn) expect(ids.has(id), `${tech.id} -> ${id}`).toBe(true)
  })

  it('no fake skill levels: technologies carry no numbers', () => {
    for (const tech of allTech) expect(Object.values(tech).some((v) => typeof v === 'number')).toBe(false)
  })

  it('project links are either absent or absolute https URLs', () => {
    for (const project of projects) {
      for (const href of Object.values(project.links)) expect(href).toMatch(/^https:\/\//)
    }
  })

  it('every project has copy in both languages', () => {
    for (const project of projects) {
      if (project.id === 'mono') continue
      expect(de.projects.items[project.id].features.length).toBeGreaterThan(0)
      expect(en.projects.items[project.id].features.length).toBe(de.projects.items[project.id].features.length)
    }
    expect(en.mono.features.length).toBe(de.mono.features.length)
  })

  it('every MONO screen has a real screenshot file', () => {
    for (const id of monoScreens) expect(existsSync(resolve(process.cwd(), `public/mono/${id}.webp`)), id).toBe(true)
  })
})

describe('source lens highlighter', () => {
  it('keeps the source text intact', () => {
    const lines = highlight(heroSource)
    const rebuilt = lines.map((line) => line.map((t) => t.text).join('')).join('\n')
    expect(rebuilt).toBe(heroSource)
  })

  it('recognises comments, strings, keywords and JSX tags', () => {
    const [line] = highlight(`const a = '<b>' // note`)
    const types = line!.filter((t) => t.text.trim()).map((t) => t.type)
    expect(types).toEqual(['keyword', 'plain', 'punct', 'string', 'comment'])
    const [jsx] = highlight('<section id="top">')
    expect(jsx![0]).toEqual({ type: 'tag', text: '<section' })
  })
})
