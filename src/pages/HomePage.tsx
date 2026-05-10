import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PermitApiStatusLine } from '../components/PermitApiStatusLine'
import { invalidatePermitRecordCache } from '../lib/recordApi'
import './DashboardPage.css'
import './HomePage.css'

export function HomePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const qRedirect = params.get('q')?.trim() ?? ''
  const [query, setQuery] = useState('')

  if (qRedirect) {
    return <Navigate to={`/permit-workflow/${encodeURIComponent(qRedirect)}`} replace />
  }

  return (
    <div className="page pageStack homePage">
      <header className="homePageHeader">
        <p className="homePageKicker">FastView · Seattle permits</p>
        <h1 className="homePageTitle">
          Find your <span className="homePageTitleAccent">permit record</span>
        </h1>
        <p className="homePageSubtitle">
          Enter a record number to load the workflow — current stage, reviews, and SDCI data for that permit.
        </p>
        <p className="homePageScopeNote">
          Focus is construction permits; demolition and land use (LU) are out of scope for now.
        </p>
      </header>

      <section className="card findRecordCard homeSearchCard">
        <div className="findRecordContent">
          <div className="findRecordHeader">
            <div className="findRecordTitle">Look up a permit</div>
            <div className="findRecordSub">
              Type or paste a record number, then open the full permit workflow.
            </div>
          </div>

          <form
            className="findRecordForm"
            onSubmit={(e) => {
              e.preventDefault()
              const id = query.trim()
              if (!id) return
              invalidatePermitRecordCache(id)
              navigate(`/permit-workflow/${encodeURIComponent(id)}`)
            }}
          >
            <div className="commandBar" role="search">
              <span className="commandIcon" aria-hidden="true">
                <Search size={18} />
              </span>
              <input
                className="commandInput"
                value={query}
                inputMode="search"
                autoComplete="off"
                placeholder="Record number (e.g. 7058372-CN)"
                aria-label="Record number"
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

          <PermitApiStatusLine />
        </div>
      </section>
    </div>
  )
}
