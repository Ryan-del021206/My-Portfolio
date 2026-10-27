import type { ProjectId } from './projects'

/**
 * The technologies Ryan listed, plus Kotlin and Jetpack Compose, which MONO
 * proves. No levels or percentages on purpose: depth is shown through the
 * projects a technology appears in (`usedIn`). `focus` marks the emphasis.
 */
export type StackGroupId = 'frontend' | 'software' | 'mobile' | 'backend' | 'ai' | 'workflow' | 'it' | 'design'

export interface Tech {
  id: string
  name: string
  focus?: boolean
  usedIn: ProjectId[]
}

export interface StackGroup {
  id: StackGroupId
  items: Tech[]
}

export const stack: StackGroup[] = [
  {
    id: 'frontend',
    items: [
      { id: 'react', name: 'React', focus: true, usedIn: ['portfolio'] },
      { id: 'typescript', name: 'TypeScript', usedIn: ['mono', 'portfolio'] },
      { id: 'javascript', name: 'JavaScript', focus: true, usedIn: ['portfolio'] },
      { id: 'html', name: 'HTML', focus: true, usedIn: ['mono', 'portfolio'] },
      { id: 'css', name: 'CSS', focus: true, usedIn: ['mono', 'portfolio'] },
    ],
  },
  {
    id: 'software',
    items: [
      { id: 'python', name: 'Python', focus: true, usedIn: ['omikron'] },
      { id: 'csharp', name: 'C#', focus: true, usedIn: [] },
      { id: 'java', name: 'Java', usedIn: ['omikron'] },
    ],
  },
  {
    id: 'mobile',
    items: [
      { id: 'kotlin', name: 'Kotlin', usedIn: ['mono'] },
      { id: 'compose', name: 'Jetpack Compose', usedIn: ['mono'] },
      { id: 'android', name: 'Android', usedIn: ['mono'] },
      { id: 'react-native', name: 'React Native', usedIn: [] },
    ],
  },
  {
    id: 'backend',
    items: [
      { id: 'node', name: 'Node.js', usedIn: [] },
      { id: 'php', name: 'PHP', usedIn: [] },
      { id: 'mysql', name: 'MySQL', usedIn: [] },
    ],
  },
  {
    id: 'ai',
    items: [{ id: 'ai-integration', name: 'KI-Integration', usedIn: [] }],
  },
  {
    id: 'workflow',
    items: [
      { id: 'git', name: 'Git & GitHub', usedIn: [] },
      { id: 'docker', name: 'Docker', usedIn: [] },
    ],
  },
  {
    id: 'it',
    items: [
      { id: 'windows', name: 'Windows', focus: true, usedIn: [] },
      { id: 'pc-hardware', name: 'PC-Hardware', usedIn: [] },
      { id: 'ms-office', name: 'Microsoft Office', usedIn: [] },
    ],
  },
  {
    id: 'design',
    items: [{ id: 'uiux', name: 'UI/UX Design', usedIn: ['mono', 'portfolio'] }],
  },
]

export const allTech = stack.flatMap((group) => group.items)

export const groupOf = (techId: string) => stack.find((group) => group.items.some((t) => t.id === techId))!.id
