/**
 * Facts that are the same in every language.
 * Everything marked OPEN is listed in README.md under "Offene Angaben".
 */
export const site = {
  name: 'Ryan',
  email: 'ryanxruppert@gmail.com',
  phone: { display: '0179 1667287', href: 'tel:+491791667287' },
  instagram: {
    handle: 'q0entin.ryan',
    // Confirmed by Ryan on 27.10.2026, so the handle is a link.
    verified: true,
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
