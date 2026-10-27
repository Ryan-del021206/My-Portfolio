/**
 * Data for the legal pages (/impressum/, /datenschutz/). German only: German
 * law requires these pages, the English site links to them.
 */
export const operator = {
  name: 'Ryan Quentin Gabriel Ruppert',
  street: 'Grimmelshausenweg 44',
  city: '59494 Soest',
  country: 'Deutschland',
  email: 'ryanxruppert@gmail.com',
} as const

/** Date of the current wording, shown on both pages. */
export const legalUpdated = '27.10.2026'

export const legalPaths = { imprint: '/impressum/', privacy: '/datenschutz/' } as const

export const legalMeta = {
  imprint: { title: 'Impressum — Ryan', description: 'Impressum der persönlichen Website von Ryan Ruppert.' },
  privacy: {
    title: 'Datenschutzerklärung — Ryan',
    description: 'Datenschutzerklärung der persönlichen Website von Ryan Ruppert.',
  },
} as const
