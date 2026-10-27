import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { legalPaths, legalUpdated, operator } from '../../content/legal'
import styles from './Legal.module.css'

function Address() {
  return (
    <p>
      {operator.name}
      <br />
      {operator.street}
      <br />
      {operator.city}
      <br />
      {operator.country}
    </p>
  )
}

function Email() {
  return <a href={`mailto:${operator.email}`}>{operator.email}</a>
}

function Imprint() {
  return (
    <>
      <h1 className={styles.heading}>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <Address />

      <h2>Kontakt</h2>
      <p>
        E-Mail: <Email />
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{operator.name}, Anschrift wie oben.</p>

      <h2>Hinweis</h2>
      <p>
        Dies ist eine private, nicht kommerzielle Website, auf der ich mich und meine Projekte vorstelle. Für Inhalte
        externer Seiten, auf die ich verlinke, sind ausschließlich deren Betreiber verantwortlich.
      </p>
    </>
  )
}

function Privacy() {
  return (
    <>
      <h1 className={styles.heading}>Datenschutz&shy;erklärung</h1>
      <p className={styles.lead}>
        Diese Website kommt ohne Cookies, ohne Tracking und ohne Analyse-Tools aus. Schriften und Bilder liegen auf
        dem eigenen Server. Hier steht, welche Daten trotzdem anfallen.
      </p>

      <h2>1. Verantwortlicher</h2>
      <Address />
      <p>
        E-Mail: <Email />
      </p>

      <h2>2. Hosting</h2>
      <p>
        Die Website wird bei Cloudflare Pages gehostet (Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107,
        USA). Beim Aufruf verarbeitet Cloudflare technisch notwendige Daten wie Ihre IP-Adresse, Datum und Uhrzeit,
        die aufgerufene Adresse sowie Browser- und Geräteangaben, um die Seite auszuliefern und vor Angriffen zu
        schützen. Rechtsgrundlage ist mein berechtigtes Interesse an einer sicheren und funktionierenden Website
        (Art. 6 Abs. 1 lit. f DSGVO). Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert, das ein
        angemessenes Datenschutzniveau für Übermittlungen in die USA sicherstellt (Art. 45 DSGVO). Mehr dazu in der{' '}
        <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">
          Datenschutzerklärung von Cloudflare
        </a>
        .
      </p>

      <h2>3. Speicherung im Browser</h2>
      <p>
        Wenn Sie die Sprache wechseln oder den Sprachhinweis schließen, merkt sich die Seite das im lokalen Speicher
        Ihres Browsers (localStorage, Einträge „locale“ und „locale-hint-dismissed“). Diese Angaben verlassen Ihr Gerät
        nicht und sind für die gewünschte Funktion nötig (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können sie jederzeit über die
        Einstellungen Ihres Browsers löschen.
      </p>

      <h2>4. MONO-Demo</h2>
      <p>
        Auf der Seite „MONO ausprobieren“ läuft meine App MONO direkt in Ihrem Browser. Alles, was Sie dort eingeben,
        wird nur im Speicher Ihres Browsers abgelegt (localStorage und IndexedDB) und nicht an mich übertragen. Sie
        können es über die Browser-Einstellungen löschen.
      </p>
      <p>
        Nur wenn Sie die Lebensmittelsuche oder den Barcode-Scanner verwenden, fragt die App Produktdaten bei Open Food
        Facts ab (Open Food Facts, Frankreich). Dabei werden Ihre IP-Adresse und der Suchbegriff bzw. Barcode an Open
        Food Facts übermittelt. Rechtsgrundlage ist Ihre Nutzung dieser Funktion (Art. 6 Abs. 1 lit. b und f DSGVO).
        Details in der{' '}
        <a href="https://world.openfoodfacts.org/privacy" rel="noopener">
          Datenschutzerklärung von Open Food Facts
        </a>
        . Für den Barcode-Scanner fragt Ihr Browser um Erlaubnis für die Kamera; die Bilder werden auf Ihrem Gerät
        ausgewertet und nicht übertragen.
      </p>

      <h2>5. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie mir schreiben, verarbeite ich Ihre E-Mail-Adresse und Ihre Nachricht, um Ihre Anfrage zu beantworten
        (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Mein E-Mail-Postfach wird von Google (Gmail) bereitgestellt. Ich lösche
        Ihre Nachricht, sobald sie erledigt ist und keine Aufbewahrungspflicht besteht.
      </p>

      <h2>6. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Schreiben Sie mir dafür
        einfach eine E-Mail.
      </p>
      <p>
        Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für mich
        zuständigen Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße
        2–4, 40213 Düsseldorf.
      </p>
    </>
  )
}

/** /impressum/ and /datenschutz/ – plain, readable, German only. */
export function Legal({ kind }: { kind: 'imprint' | 'privacy' }) {
  const other: { href: string; label: ReactNode } =
    kind === 'imprint'
      ? { href: legalPaths.privacy, label: 'Datenschutzerklärung' }
      : { href: legalPaths.imprint, label: 'Impressum' }
  return (
    <>
      <header className={styles.bar}>
        <div className={`container ${styles.barInner}`}>
          <a href="/" className={styles.back}>
            <ArrowLeft size={18} aria-hidden="true" />
            Zur Startseite
          </a>
          <a href={other.href} className={styles.other}>
            {other.label}
          </a>
        </div>
      </header>
      <main id="main" className={`container ${styles.page}`}>
        <article className={styles.text}>
          {kind === 'imprint' ? <Imprint /> : <Privacy />}
          <p className={styles.updated}>Stand: {legalUpdated}</p>
        </article>
      </main>
    </>
  )
}
