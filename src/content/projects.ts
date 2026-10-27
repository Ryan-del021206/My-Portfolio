/**
 * Projects found in Ryan's workspace. Only facts visible in the project files
 * are used; texts live in the dictionaries (i18n/de.ts, en.ts).
 *
 * - mono:      E:\Ryan R\Desktop\MONO (Kotlin/Compose Android app + Preact PWA for iPhone, v4.4)
 * - omikron:   games & mods – E:\Files\Projects\Gaming: Omikron MOd (Fabric mod, Java) + SeedViewer.pyw,
 *              Server\main.py (Minecraft server manager, Tkinter), Minecraft Server (Paper + plugins),
 *              Server (NeoForge modpack server), Visier-Overlay\visier.py
 * - portfolio: this repository
 */
export type ProjectStatus = 'concept' | 'inProgress' | 'done'

export type ProjectId = 'mono' | 'omikron' | 'portfolio'

export interface Project {
  id: ProjectId
  status: ProjectStatus
  tech: string[]
  /** Public demo / repository. Empty until a real, public link exists. */
  links: { demo?: string; repo?: string }
}

export const projects: Project[] = [
  {
    id: 'mono',
    status: 'done',
    tech: ['Kotlin', 'Jetpack Compose', 'ML Kit', 'Health Connect', 'TypeScript', 'Preact', 'PWA'],
    links: {},
  },
  {
    id: 'omikron',
    status: 'inProgress',
    tech: ['Java', 'Fabric API', 'Mixin', 'Gradle', 'Python', 'Tkinter', 'Paper', 'NeoForge'],
    links: {},
  },
  {
    id: 'portfolio',
    status: 'done',
    tech: ['React', 'TypeScript', 'Vite', 'three.js', 'CSS'],
    links: {},
  },
]

/** Real screenshots from MONO (Android emulator, v4.0–4.2), see public/mono. */
export const monoScreens = ['home', 'training', 'library', 'mood'] as const
export type MonoScreen = (typeof monoScreens)[number]

export const projectAnchor = (id: ProjectId) => (id === 'mono' ? 'mono' : `project-${id}`)
