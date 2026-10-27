/**
 * Facts that are the same in every language.
 * Everything marked OPEN is listed in README.md under "Offene Angaben".
 */
export const site = {
  name: 'Ryan',
  email: 'ryanxruppert@gmail.com',
  instagram: {
    handle: 'q0entin.ryan',
    // OPEN: set to true once the profile is confirmed, then the handle becomes a link.
    verified: false,
  },
  location: 'Soest',
  timeZone: 'Europe/Berlin',
} as const

export const instagramUrl = `https://www.instagram.com/${site.instagram.handle}/`

/** "Hello" in the two languages Ryan speaks – shown in the hero. */
export const greetings = [
  { lang: 'de', text: 'Hallo' },
  { lang: 'en', text: 'Hello' },
] as const

/** Started programming at about 13, is 19 now. */
export const yearsCoding = 19 - 13
