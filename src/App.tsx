import { About } from './components/About/About'
import { Contact } from './components/Contact/Contact'
import { CursorRing } from './components/Cursor/CursorRing'
import { Drive } from './components/Drive/Drive'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { LanguageHint } from './components/LanguageHint/LanguageHint'
import { MonoDemo } from './components/MonoDemo/MonoDemo'
import { Marquee } from './components/Marquee/Marquee'
import { MonoShowcase } from './components/Mono/MonoShowcase'
import { ParticleField } from './components/ParticleField/ParticleField'
import { Process } from './components/Process/Process'
import { Projects } from './components/Projects/Projects'
import { Stack } from './components/Stack/Stack'
import { I18nProvider } from './i18n/I18nProvider'
import { useI18n } from './i18n/useI18n'
import type { PageId } from './i18n/locale'
import type { Locale } from './i18n/types'

function Page() {
  const { t } = useI18n()
  return (
    <>
      <a href="#main" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <ParticleField />
      <Header />
      <main id="main" className="content-layer" tabIndex={-1}>
        <Hero />
        <Marquee />
        <About />
        <MonoShowcase />
        <Projects />
        <Stack />
        <Process />
        <Drive />
        <Contact />
      </main>
      <Footer />
      <LanguageHint />
      <CursorRing />
    </>
  )
}

export function App({ initialLocale, page = 'home' }: { initialLocale: Locale; page?: PageId }) {
  return (
    <I18nProvider initialLocale={initialLocale} page={page}>
      {page === 'mono' ? <MonoDemo /> : <Page />}
    </I18nProvider>
  )
}
