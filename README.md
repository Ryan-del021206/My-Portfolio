# Ryan — IT & Entwicklung

Persönliches Portfolio von Ryan (IT & Entwicklung, Soest; seit 27.10.2026 auf „offen für eine Festanstellung in der IT“ ausgerichtet statt Freelance). Domain: **txr-ryan.de** (Build mit `SITE_URL=https://txr-ryan.de`). React 19, TypeScript, Vite 8 und three.js; zweisprachig (DE/EN), nur Dark Mode, statisch vorgerendert.

**Leitidee: „Neugier, kompiliert.“** Ryans Geschichte beginnt mit dem Wunsch, zu verstehen, wie Dinge funktionieren. Darauf baut die Seite auf: Unter der Oberfläche liegt echter Code, und die Grafik reagiert auf den Besucher.

## Was auf der Seite passiert

| Bereich | Effekt |
|---|---|
| ganze Seite | **WebGL-Partikelfeld** (three.js, ein Draw-Call): jede Sektion hat ihre eigene feste Form, die mit ihr scrollt; nichts fliegt oder verwandelt sich zwischen den Sektionen (Planet → DNA-Helix → **MONO-Logo** → Bausteine → Orbits → Wellenlandschaft → Ring); weicht der Maus aus |
| Hero | Ryans Avatar (`public/ryan.png`), Begrüßung im Wechsel auf Deutsch und Englisch; Live-Uhrzeit in Soest; **Quelltext-Lupe** zeigt den echten Code des Abschnitts |
| Laufband | zwei gegenläufige Bänder mit echten Fakten |
| Über mich | Avatar mit blauem Ring, Zeitleiste, die sich beim Scrollen füllt; echte Zahlen mit Hochzählen; **interaktives Terminal** (`help`, `whoami`, `mono`, `sudo hire-ryan` …) |
| MONO | **3D-Handy** (generierte Geometrie, Umgebungslicht, blaues Kantenlicht) mit echten Screenshots, folgt Maus und Scroll; riesiger Schriftzug, der sich beim Scrollen füllt |
| Stack | **drehbare 3D-Kugel** aus echten Buttons: ziehen, klicken, per Tab steuerbar |
| überall | Cursor-Ring auf dem Desktop, Lesefortschritt, Sprachwechsel als Überblendung |

Alle Effekte respektieren `prefers-reduced-motion`. Die 3D-Teile laden erst nach dem ersten Seitenaufbau; ohne WebGL bleibt die Seite vollständig (das Handy zeigt dann den Screenshot im CSS-Rahmen).

---

## Starten

**Am einfachsten:** Doppelklick auf `Portfolio starten.bat` auf dem Desktop (`E:\Ryan R\Desktop`). Das Menü startet die Website, den Entwicklungsmodus, einen Neu-Build oder alle Prüfungen und zeigt die offenen To-dos an.

Voraussetzung: Node.js ≥ 20 (getestet mit Node 24.13).

```bash
npm install
npm run dev          # Entwicklung: http://localhost:5173 (Englisch unter /en/)
npm run build        # Produktions-Build inkl. Vorrendern nach dist/
npm run preview      # Build lokal ansehen: http://localhost:4173
```

| Befehl | Zweck |
|---|---|
| `npm run typecheck` | TypeScript (strict), inkl. Tests |
| `npm run lint` | oxlint |
| `npm test` | Vitest: Übersetzungen, Inhalte, Screenshots vorhanden, Render-/Link-/A11y-Prüfungen |
| `node scripts/qa.mjs [url] [ordner]` | Browser-QA mit Headless Chrome (Software-WebGL) gegen `npm run preview`: 4 Viewports × 2 Sprachen, Überlauf, Schrift < 12 px, Anker-Abstände, Konsole, Interaktionen inkl. 3D, Screenshots. `QA_MOTION=1` macht Screenshots mit Animationen. |
| `npm run og` | Social-Preview-Bilder `public/og-de.png` / `og-en.png` neu erzeugen (braucht Chrome) |

## Aufbau

```
src/
  content/        site.ts (Kontakt, Grüße), projects.ts (MONO, Omikron, Portfolio), stack.ts
  i18n/           de.ts, en.ts (alle Texte), types.ts (Dictionary-Interface), Provider, Locale-Helfer
  three/          particleScene.ts, phoneScene.ts – reine three.js-Szenen, per import() nachgeladen
  components/     Header, Hero (+ SourceLens, Greeting, SoestClock), Marquee, About (+ Terminal),
                  Mono, Projects, Stack (+ StackGlobe), Process, Drive, Contact, Footer,
                  ParticleField, Cursor, LanguageHint
  styles/         tokens.css (Design-Tokens), global.css (einzige globale Regeln)
public/mono/      echte MONO-Screenshots (WebP) und App-Icon
scripts/          prerender.mjs, og-image.mjs, qa.mjs
```

- **Texte ändern:** nur in `src/i18n/de.ts` und `src/i18n/en.ts`. Fehlt eine Übersetzung, schlägt `tsc` fehl.
- **MONO-Screenshots tauschen:** Dateien in `public/mono/` ersetzen (Hochformat ~9 : 20, z. B. 540 × 1200 WebP). Namen stehen in `monoScreens` in `src/content/projects.ts`.
- **Technologie einem Projekt zuordnen:** `usedIn` in `src/content/stack.ts`.

## Design

- **Farben „Blau“ (seit 27.10.2026, vorher Orange):** fast Schwarz (`#08080A`, passend zu MONOs Schwarz-Weiß), Blau `#4D9FFF` als einziger Akzent, Eisblau `#9FD0FF` als helles Licht (Token heißt weiter `--amber`). Alle Textfarben erfüllen WCAG AA, die meisten AAA.
- **Nur Dark Mode**, kein Umschalter.
- **Typografie:** Mona Sans (variable Breitenachse) und Martian Mono (Code/Terminal), beide selbst gehostet.
- **Keine erfundenen Inhalte:** keine Prozentbalken, Logos oder Testimonials. Alle Zahlen stammen aus echten Quellen (Alter, Sprachen, MONO-README).

## Sprache & SEO

- `/` = Deutsch, `/en/` = Englisch, beide als statisches HTML vorgerendert.
- Kein automatischer Redirect; bevorzugt der Browser die andere Sprache, erscheint ein dezenter Hinweis.
- Open Graph, Twitter Card und JSON-LD (`Person`) pro Sprache.

## Deployment – noch zu erledigen

1. **Domain festlegen** und beim Build angeben, erst dann entstehen Canonical, `hreflang`, `og:url` und `sitemap.xml`:
   ```bash
   SITE_URL=https://deine-domain.de npm run build
   ```
   (Windows PowerShell: `$env:SITE_URL="https://deine-domain.de"; npm run build`)
2. **Hosting wählen.** `dist/` ist rein statisch (z. B. Cloudflare Pages, Netlify, Vercel). Kein Server, keine Datenbank, keine Secrets.
3. **Security-Header** beim Hoster setzen, z. B.:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   ```
   `style-src 'unsafe-inline'` ist nötig, weil Lupe, Globus und Zeitleiste Positionen als Inline-Styles setzen.
4. **Rechtliches (Deutschland):** **Impressum** (§ 5 DDG) und **Datenschutzerklärung** fehlen bewusst, weil dafür echte Angaben (u. a. ladungsfähige Anschrift) nötig sind. Vor der Veröffentlichung ergänzen und im Footer verlinken. Die Seite setzt keine Cookies, lädt nichts von Drittanbietern und hat kein Tracking.

## Offene Angaben – bitte prüfen

| Punkt | Stand auf der Seite | Was zu tun ist |
|---|---|---|
| MONO-Startseite zeigt Körperwerte | Screenshot `home.webp` zeigt „Hallo Ryan“, 84,0 kg, BMI 25,4 | ✅ Am 25.10.2026 von Ryan freigegeben (Testdaten, darf öffentlich sein). |
| MONO öffentlich? | „privat im Einsatz, noch nicht veröffentlicht“, kein Link | Falls du die iPhone-Web-App online stellst (README von MONO, Netlify), Link in `projects.ts` eintragen. |
| Kotlin & Jetpack Compose | im Stack ergänzt (durch MONO belegt) | Bestätigen, dass du sie aufführen möchtest. |
| Flutter-Fitness-App | entfernt (ersetzt durch MONO) | – |
| Omikron | gezeigt als persönliches Projekt | Bestätigen; ideal wären echte Screenshots/Video. |
| Instagram `@q0entin.ryan` | als Text, **nicht verlinkt** | Profil prüfen, dann `instagram.verified: true` in `src/content/site.ts`. |
| Sprachen im Terminal | Englisch als „Zweitsprache“, Russisch/Polnisch „Grundkenntnisse“ | Formulierung anpassen, falls gewünscht. |
| „Nachtschicht? Gut möglich.“ | erscheint zwischen 0 und 5 Uhr neben der Uhr | Augenzwinkernd gemeint – bei Nichtgefallen in `de.ts`/`en.ts` ändern. |
| Weitere Projekte | nicht aufgenommen | Veytrix, DualEdge, Trading-Bots, Jarvis u. a. – entscheiden, was gezeigt wird. |
| Anrede | durchgehend „du“ | Ggf. auf „Sie“ ändern. |

## Qualitätsstand (gemessen am 25.10.2026)

- Build, `tsc` (strict, inkl. Tests), oxlint (0 Warnungen), 22 Unit-Tests: bestanden.
- `scripts/qa.mjs`: 4 Viewports (1440/1000/390/360 px) × DE/EN ohne Überlauf, ohne Text < 12 px, ohne Konsolenfehler; Anker 32 px (Desktop) bzw. 24 px (Mobile) unter dem Header. Interaktionen bestanden: Terminal, MONO-Bildschirme, 3D-Handy und Partikelfeld geladen, Lupe, Stack, Mobile-Menü, Sprachwechsel inkl. Zurück-Button.
- Lighthouse 13 (lokal, `vite preview`): Desktop 100 / 100 / 100 / 100, Mobil 91 / 100 / 100 / 100 (Performance / A11y / Best Practices / SEO). three.js liegt als eigener Chunk (143 kB gzip) und lädt erst nach dem Seitenaufbau, auf Handys erst beim ersten Scrollen.
- Getestet in Chromium (Chrome headless mit Software-WebGL). Nicht getestet: Safari, Firefox, echte Smartphones – dort Bildrate und Wärmeentwicklung bitte einmal selbst prüfen.

## Verwendete Skills und Wissensbasis

Im Projekt unter `.claude/skills/` (`skills-lock.json`): `web-design-guidelines`, `frontend-design`, `ui-ux-pro-max`, `frontend-design-system`, `responsive-design`, `web-accessibility`, `ui-component-patterns`, `react-patterns`, `react-code-review`. Grundlage außerdem `E:\Hermes\Knowledge\WebEngineering` (Default Spec, AI-Tells, Learnings, QA, i18n, Motion, **3D-Performance, Partikel, 3D-Interaktion**).
