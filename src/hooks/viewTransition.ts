export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Runs `update` inside a same-document view transition when the browser
 * supports it and the visitor hasn't asked for reduced motion.
 * `kind` is exposed as html[data-vt] so CSS can style each transition.
 */
export function withViewTransition(kind: string, update: () => void): ViewTransition | null {
  // Hidden documents may never render the transition, so the update would stall.
  if (!document.startViewTransition || prefersReducedMotion() || document.hidden) {
    update()
    return null
  }
  const root = document.documentElement
  root.dataset.vt = kind
  const transition = document.startViewTransition(update)
  transition.finished.finally(() => {
    if (root.dataset.vt === kind) delete root.dataset.vt
  })
  return transition
}
