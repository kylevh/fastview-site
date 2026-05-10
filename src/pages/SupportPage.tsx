import './InfoPages.css'

/** Plus-address alias (`+fastview`) so you can filter FastView mail in Outlook without exposing your primary inbox. */
const SUPPORT_EMAIL = 'kylevh+fastview@outlook.com'

export function SupportPage() {
  return (
    <div className="page pageStack">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Support</h1>
        </div>
      </div>

      <section className="card" aria-labelledby="support-about-heading">
        <h2 className="cardTitle" id="support-about-heading">
          What FastView is
        </h2>
        <p className="infoCardBody">
          FastView is an unofficial permit viewer—not run by SDCI or the City of Seattle. On the primary SDCI permit site, review statuses are often spread across collapsible panels and menus—you end up clicking through a lot of UI just to see where things stand. FastView uses the same underlying permit data (via a companion API) but lays it out as dedicated <strong>Permit workflow</strong> and <strong>Review status</strong> screens so you can scan the timeline and review picture without hunting through dropdowns for each piece.
        </p>
      </section>

      <section className="card" aria-labelledby="support-scope-heading">
        <h2 className="cardTitle" id="support-scope-heading">
          Scope &amp; limitations
        </h2>
        <p className="infoCardBody">
          Right now FastView is built around <strong>construction permit</strong> records.{' '}
          <strong>Demolition</strong> (&ldquo;demo&rdquo;) permits and <strong>land use (LU)</strong> filings are out of scope
          for now—those workflows differ on SDCI, so what you see here may not line up with those record types.
        </p>
      </section>

      <section className="card" aria-labelledby="support-use-heading">
        <h2 className="cardTitle" id="support-use-heading">
          How to use it
        </h2>
        <ol className="supportSteps">
          <li>
            <strong>Search</strong>
            Enter a Seattle permit record number (e.g. <code className="infoMono">7058372-CN</code>) and hit Search. If the API has that permit, you&apos;ll open the workflow view.
          </li>
          <li>
            <strong>Workflow &amp; reviews</strong>
            After a record is loaded, use the sidebar for workflow vs review detail—those links stay tied to whatever record is in the URL.
          </li>
          <li>
            <strong>Green / amber chip on Search</strong>
            That&apos;s just a cheap <code className="infoMono">/health</code> ping to the same server that serves permit JSON. It can fail when the server&apos;s asleep, CORS is picky, or your network blips—even if SDCI itself is fine.
          </li>
        </ol>
      </section>

      <section className="card" aria-labelledby="support-slow-heading">
        <h2 className="cardTitle" id="support-slow-heading">
          Slow or failing loads
        </h2>
        <ul className="infoMutedList">
          <li>
            <strong>Cold servers:</strong> Free-tier hosts nap when idle. First request after a while can take minutes (sometimes ~five).
          </li>
          <li>
            <strong>Wrong or missing record:</strong> Double-check the ID on the real{' '}
            <a className="infoExternal" href="https://www.seattle.gov/sdci" target="_blank" rel="noopener noreferrer">
              SDCI
            </a>{' '}
            side—this app only shows what the API returns.
          </li>
        </ul>
      </section>

      <section className="card supportDisclaimerCard" aria-labelledby="support-legal-heading">
        <h2 className="cardTitle" id="support-legal-heading">
          Not official — please read
        </h2>
        <p className="infoCardBody">
          FastView is <strong>not</strong> affiliated with, endorsed by, or run by the City of Seattle, SDCI, or any government agency. It is an independent, unofficial viewer for convenience only.
        </p>
        <p className="infoCardBody">
          Information here may be incomplete, outdated, or wrong. <strong>Do not rely on this site for legal deadlines, fees, compliance, or official permit status.</strong> Always verify on the official SDCI portal and official records.
        </p>
        <p className="infoCardBody">
          The site is provided &ldquo;as is,&rdquo; without warranties of any kind. Your use is at your sole risk. To the fullest extent allowed by law, the operator of this site is not liable for any damages or losses arising from use of FastView—including relying on anything you see here instead of official sources.
        </p>
      </section>

      <section className="card" aria-labelledby="support-contact-heading">
        <h2 className="cardTitle" id="support-contact-heading">
          Contact
        </h2>
        <p className="infoCardBody">
          For feedback or problem reports, email below.
        </p>
        <p className="infoCardBody">
          <a className="infoExternal" href={`mailto:${encodeURIComponent(SUPPORT_EMAIL)}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </div>
  )
}
