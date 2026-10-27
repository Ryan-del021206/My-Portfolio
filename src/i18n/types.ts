import type { MonoScreen, ProjectId, ProjectStatus } from '../content/projects'
import type { StackGroupId } from '../content/stack'

export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export interface ProjectCopy {
  name: string
  kind: string
  summary: string
  goal: string
  features: string[]
  decisions: string[]
  /** Short note shown instead of links while nothing is public. */
  availability: string
}

export type CardProjectId = Exclude<ProjectId, 'mono'>

export type TerminalCommand = 'help' | 'whoami' | 'projects' | 'mono' | 'stack' | 'languages' | 'contact' | 'hire' | 'time'

/**
 * Every visible string, ARIA label and meta text. Both dictionaries must
 * implement this interface completely, so a missing translation fails `tsc`.
 */
export interface Dictionary {
  meta: {
    title: string
    description: string
    ogLocale: string
    ogImageAlt: string
  }
  a11y: {
    skipToContent: string
    mainNav: string
    openMenu: string
    closeMenu: string
    menuTitle: string
    languageSwitch: string
    homeLink: string
  }
  nav: {
    about: string
    mono: string
    projects: string
    stack: string
    process: string
    contact: string
    cta: string
  }
  language: {
    current: string
    /** Shown to visitors whose browser prefers this language while they read the other one. */
    hint: string
    hintAction: string
    hintDismiss: string
  }
  avatarAlt: string
  hero: {
    greetingSuffix: string
    greetingLabel: string
    titleLines: string[]
    lead: string
    primaryCta: string
    secondaryCta: string
    clockLabel: string
    nightNote: string
    facts: { label: string; value: string }[]
    lensOpen: string
    lensClose: string
    lensHint: string
    lensCaption: string
  }
  marquee: string[]
  about: {
    heading: string
    intro: string
    chapters: { label: string; title: string; text: string }[]
    statsHeading: string
    stats: { value: string; label: string }[]
  }
  terminal: {
    heading: string
    intro: string
    title: string
    inputLabel: string
    suggestionsLabel: string
    welcome: string
    notFound: (command: string) => string
    output: Record<TerminalCommand, string[]>
    time: (time: string) => string
    hireAction: string
  }
  mono: {
    eyebrow: string
    tagline: string
    summary: string
    status: string
    platforms: string[]
    highlights: { value: string; label: string }[]
    screensLabel: string
    screens: Record<MonoScreen, { label: string; alt: string }>
    sourceNote: string
    featuresLabel: string
    features: string[]
    decisionsLabel: string
    decisions: string[]
    techLabel: string
    availability: string
    /** Link to the demo page where the iPhone version runs in the browser. */
    tryCta: string
    dragHint: string
  }
  projects: {
    heading: string
    intro: string
    names: Record<ProjectId, string>
    status: Record<ProjectStatus, string>
    detailsOpen: string
    goalLabel: string
    featuresLabel: string
    decisionsLabel: string
    techLabel: string
    linksLabel: string
    linkNames: { demo: string; repo: string }
    visualLabel: Record<CardProjectId, string>
    items: Record<CardProjectId, ProjectCopy>
    /** The game projects shown as tiles in the games card. */
    games: { name: string; kind: string; tech: string }[]
    portfolioVisual: { rendered: string; source: string }
  }
  stack: {
    heading: string
    intro: string
    groups: Record<StackGroupId, string>
    focusLabel: string
    focusLegend: string
    globeHint: string
    globeLabel: string
    techNames: Partial<Record<string, string>>
    usedInLabel: string
    notShownYet: string
    detailTitle: (name: string) => string
  }
  process: {
    heading: string
    intro: string
    resultLabel: string
    steps: { title: string; text: string; result: string }[]
  }
  drive: {
    heading: string
    statement: string
    text: string
    nowHeading: string
    now: string[]
  }
  contact: {
    heading: string
    text: string
    pricing: string
    emailLabel: string
    emailCta: string
    mailSubject: string
    copy: string
    copied: string
    copyFailed: string
    instagramLabel: string
    otherHeading: string
    checklistHeading: string
    checklist: string[]
  }
  monoDemo: {
    metaTitle: string
    metaDescription: string
    back: string
    eyebrow: string
    heading: string
    intro: string
    stepsHeading: string
    steps: string[]
    privacy: string
    openFull: string
    frameTitle: string
    aboutEyebrow: string
    aboutHeading: string
    about: string[]
    facts: { label: string; value: string }[]
    contactCta: string
    homeCta: string
  }
  footer: {
    tagline: string
    navLabel: string
    builtWith: string
    rights: (year: number) => string
    backToTop: string
  }
}
