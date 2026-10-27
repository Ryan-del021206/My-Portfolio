import '@fontsource-variable/mona-sans/wdth.css'
import '@fontsource-variable/martian-mono/wdth.css'
import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { localeFromPath, pageFromPath } from './i18n/locale'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App initialLocale={localeFromPath(location.pathname)} page={pageFromPath(location.pathname)} />
  </StrictMode>
)

// Production pages are pre-rendered (scripts/prerender.mjs) and hydrated; the dev server renders from scratch.
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)
