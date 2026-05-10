import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { TopBarSearch } from './components/TopBarSearch'
import { PageTransitionLayout } from './layouts/PageTransitionLayout'
import { useGlobalRecordSearchValue } from './lib/useGlobalRecordSearchValue'
import { useDocumentTitle } from './lib/useDocumentTitle'
import { CircleHelp, Files, GitPullRequestArrow, ScanSearch, Search, ShieldCheck } from 'lucide-react'
import { TopBarMenus } from './components/TopBarMenus'
import { HomePage } from './pages/HomePage'
import { PermitWorkflowPage } from './pages/PermitWorkflowPage'
import { ReviewStatusPage } from './pages/ReviewStatusPage'
import { SupportPage } from './pages/SupportPage'
import './App.css'

function NavIcon({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <span className="navIcon" aria-hidden="true" title={label}>
      {children}
    </span>
  )
}

/** Permit workflow + review only apply once a record is in the URL — disabled otherwise (no redirect churn). */
function SidebarRecordNav() {
  const recordId = useGlobalRecordSearchValue().trim()
  const hasRecord = recordId.length > 0
  const location = useLocation()

  const workflowTo = `/permit-workflow/${encodeURIComponent(recordId)}`
  const reviewTo = `/review-status?record=${encodeURIComponent(recordId)}`

  const pathSegs = location.pathname.split('/').filter(Boolean)
  let onWorkflowForRecord = false
  if (pathSegs[0] === 'permit-workflow' && pathSegs[1]) {
    try {
      onWorkflowForRecord = decodeURIComponent(pathSegs[1]) === recordId
    } catch {
      onWorkflowForRecord = pathSegs[1] === recordId
    }
  }

  const recordQuery = new URLSearchParams(location.search).get('record')?.trim() ?? ''
  const onReviewForRecord = location.pathname === '/review-status' && recordQuery === recordId

  if (!hasRecord) {
    return (
      <>
        <span
          className="navItem navItemDisabled"
          aria-disabled="true"
          title="Look up a record number first"
        >
          <NavIcon label="Permit workflow">
            <GitPullRequestArrow size={18} />
          </NavIcon>
          <span>Permit workflow</span>
        </span>
        <span
          className="navItem navItemDisabled"
          aria-disabled="true"
          title="Look up a record number first"
        >
          <NavIcon label="Review status">
            <ShieldCheck size={18} />
          </NavIcon>
          <span>Review status</span>
        </span>
      </>
    )
  }

  return (
    <>
      <NavLink
        to={workflowTo}
        className={() => (onWorkflowForRecord ? 'navItem active' : 'navItem')}
      >
        <NavIcon label="Permit workflow">
          <GitPullRequestArrow size={18} />
        </NavIcon>
        <span>Permit workflow</span>
      </NavLink>

      <NavLink to={reviewTo} className={() => (onReviewForRecord ? 'navItem active' : 'navItem')}>
        <NavIcon label="Review status">
          <ShieldCheck size={18} />
        </NavIcon>
        <span>Review status</span>
      </NavLink>
    </>
  )
}

function App() {
  useDocumentTitle()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <ScanSearch size={20} />
          </div>
          <div className="brandText">
            <div className="brandName">FastView</div>
            <div className="brandSub">SDCI Permit Viewer</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}>
            <NavIcon label="Search">
              <Search size={18} />
            </NavIcon>
            <span>Search</span>
          </NavLink>

          <SidebarRecordNav />

          <span className="navItem navItemDisabled" aria-disabled="true" title="Coming soon">
            <NavIcon label="Documents">
              <Files size={18} />
            </NavIcon>
            <span>Documents</span>
          </span>
        </nav>

        <div className="sidebarBottom">
          <div className="sidebarDivider" role="separator" aria-hidden="true" />

          <nav className="nav navBottom">
            <NavLink to="/support" className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}>
              <NavIcon label="Support">
                <CircleHelp size={18} />
              </NavIcon>
              <span>Support</span>
            </NavLink>
          </nav>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <TopBarSearch />
          <div className="topbarRight">
            <TopBarMenus />
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route element={<PageTransitionLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<Navigate to="/" replace />} />
              <Route path="/permit-workflow" element={<PermitWorkflowPage />} />
              <Route path="/permit-workflow/:recordNumber" element={<PermitWorkflowPage />} />
              <Route path="/review-status" element={<ReviewStatusPage />} />
              <Route path="/documents" element={<Navigate to="/" replace />} />
              <Route path="/settings" element={<Navigate to="/support" replace />} />
              <Route path="/support" element={<SupportPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
