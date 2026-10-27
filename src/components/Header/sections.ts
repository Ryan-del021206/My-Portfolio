export const navSections = ['about', 'mono', 'projects', 'stack', 'process', 'contact'] as const

export type NavSection = (typeof navSections)[number]
