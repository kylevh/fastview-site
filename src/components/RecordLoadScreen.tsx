import './RecordLoadScreen.css'

type RecordLoadScreenProps = {
  recordNumber: string
  /** Workflow permit fetch vs review bundle */
  mode: 'workflow' | 'reviews'
}

const copy: Record<
  RecordLoadScreenProps['mode'],
  { title: string; subtitle: string }
> = {
  workflow: {
    title: 'Fetching permit data from SDCI',
    subtitle:
      'Loading permit data from SDCI. If the backend has been idle, cold startup can take up to about five minutes.',
  },
  reviews: {
    title: 'Loading review activity',
    subtitle: 'Pulling discipline reviews and status details for this permit.',
  },
}

export function RecordLoadScreen({ recordNumber, mode }: RecordLoadScreenProps) {
  const { title, subtitle } = copy[mode]

  return (
    <section
      className="recordLoadScreen card"
      aria-busy="true"
      aria-live="polite"
      aria-label={`Loading data for record ${recordNumber}`}
    >
      <div className="recordLoadScreenGlow" aria-hidden="true" />
      <div className="recordLoadScreenGrid" aria-hidden="true" />

      <div className="recordLoadScreenInner">
        <header className="recordLoadScreenBrand">
          <span className="recordLoadScreenEyebrow">FastView</span>
          <p className="recordLoadScreenDeptName">
            Seattle Department of Construction and Inspections
          </p>
        </header>

        <div className="recordLoadScreenCenter">
          <div className="recordLoadOrb" aria-hidden="true">
            <span className="recordLoadOrbArc" />
            <span className="recordLoadOrbDot" />
          </div>

          <h2 className="recordLoadScreenTitle">{title}</h2>
          <p className="recordLoadScreenSub">{subtitle}</p>
        </div>

        <footer className="recordLoadScreenFooter">
          <div className="recordLoadScreenMeta">
            <span className="recordLoadScreenMetaLabel">Permit record</span>
            <span className="recordLoadScreenRecord mono">{recordNumber}</span>
          </div>
        </footer>
      </div>
    </section>
  )
}
