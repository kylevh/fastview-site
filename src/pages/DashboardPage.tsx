import { useMemo, useState } from 'react'
import { AlertTriangle, Bookmark, Clock, Eye, Search, X } from 'lucide-react'
import './DashboardPage.css'

export function DashboardPage() {
  const [query, setQuery] = useState('')

  const stats = useMemo(
    () => [
      { label: 'Watched permits', value: '12', tone: 'neutral', Icon: Bookmark },
      { label: 'Needs your action', value: '2', tone: 'warn', Icon: AlertTriangle },
      { label: 'Stale (14+ days)', value: '4', tone: 'danger', Icon: Clock },
    ],
    []
  )

  const watchedPermits = useMemo(
    () => [
      {
        recordNumber: '7603423-CN',
        address: '1234 5th Ave, Seattle, WA',
        type: 'Construction',
        status: 'In Review',
        lastUpdated: '2h ago',
      },
      {
        recordNumber: '7058372-CN',
        address: '901 Pine St, Seattle, WA',
        type: 'Construction',
        status: 'Corrections Requested',
        lastUpdated: 'Yesterday',
      },
      {
        recordNumber: '7140292-CN',
        address: '1501 4th Ave, Seattle, WA',
        type: 'Construction',
        status: 'Issued',
        lastUpdated: '3 days ago',
      },
    ],
    []
  )

  const getStatusTone = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('correction')) return 'warn'
    if (s.includes('issued') || s.includes('approved') || s.includes('complete')) return 'success'
    if (s.includes('in review')) return 'info'
    if (s.includes('open')) return 'neutral'
    return 'neutral'
  }

  return (
    <div className="page dashboard">
      <div className="stack">
        <section className="card findRecordCard">
          <div className="findRecordContent">
            <div className="findRecordHeader">
              <div className="findRecordTitle">Find a Record</div>
              <div className="findRecordSub">Enter a record number to track status and review details.</div>
            </div>

            <form
              className="findRecordForm"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <div className="commandBar" role="search">
                <span className="commandIcon" aria-hidden="true">
                  <Search size={18} />
                </span>
                <input
                  className="commandInput"
                  value={query}
                  inputMode="text"
                  autoComplete="off"
                  placeholder="Enter record number (e.g., 7603423-CN)"
                  onChange={(e) => setQuery(e.target.value)}
                />
                <span className="commandHint" aria-hidden="true">
                  Enter
                </span>
                <button className="commandButton" type="submit">
                  Search
                </button>
              </div>
            </form>

            <div className="findRecordMeta" aria-label="System status">
              <span className="metaDot" aria-hidden="true" />
              Connected to SDCI Portal
            </div>
          </div>
        </section>

        <div className="dashboardGrid">
          {stats.map((s) => (
            <section key={s.label} className={`card statCard statCard-${s.tone}`}>
              <div className="statTop">
                <div className="statTitle">{s.label}</div>
                <div className="statIcon" aria-hidden="true">
                  <s.Icon size={18} />
                </div>
              </div>
              <div className="statValue">{s.value}</div>
              <div className="statHint">
                {s.tone === 'neutral'
                  ? 'Records you’re tracking'
                  : s.tone === 'warn'
                    ? 'Corrections / resubmission likely'
                    : 'No status movement recently'}
              </div>
            </section>
          ))}
        </div>

        <section className="card watchedCard">
          <div className="watchedHeader">
            <div className="watchedTitleRow">
              <span className="watchedIcon" aria-hidden="true">
                <Eye size={18} />
              </span>
              <div className="watchedTitle">Watched permits</div>
            </div>
          </div>

          <div className="table watchedTable">
            <div className="tr th watchedTr">
              <div>Record #</div>
              <div>Address</div>
              <div>Type</div>
              <div>Status</div>
              <div>Last updated</div>
              <div>Remove</div>
            </div>

            {watchedPermits.map((p) => (
              <div key={p.recordNumber} className="tr watchedTr">
                <div className="tdStrong mono">
                  <a
                    className="recordLink"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    {p.recordNumber}
                  </a>
                </div>
                <div>{p.address}</div>
                <div className="muted">{p.type}</div>
                <div>
                  <span className={`chip chip-${getStatusTone(p.status)}`}>{p.status}</span>
                </div>
                <div className="muted">{p.lastUpdated}</div>
                <div>
                  <button className="iconAction iconActionDanger" type="button" aria-label={`Remove ${p.recordNumber}`}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

