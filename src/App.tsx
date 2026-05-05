import { NavLink, Route, Routes } from 'react-router-dom'
import {
  Bell,
  Building2,
  CircleHelp,
  Files,
  Gauge,
  GitPullRequestArrow,
  Search,
  Settings,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { PermitWorkflowPage } from './pages/PermitWorkflowPage'
import { ReviewStatusPage } from './pages/ReviewStatusPage'
import { SettingsPage } from './pages/SettingsPage'
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

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <Building2 size={20} />
          </div>
          <div className="brandText">
            <div className="brandName">FastView</div>
            <div className="brandSub">SDCI Permit Viewer</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}>
            <NavIcon label="Dashboard">
              <Gauge size={18} />
            </NavIcon>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/permit-workflow"
            className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}
          >
            <NavIcon label="Permit workflow">
              <GitPullRequestArrow size={18} />
            </NavIcon>
            <span>Permit workflow</span>
          </NavLink>

          <NavLink
            to="/review-status"
            className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}
          >
            <NavIcon label="Review status">
              <ShieldCheck size={18} />
            </NavIcon>
            <span>Review status</span>
          </NavLink>

          <NavLink to="/documents" className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}>
            <NavIcon label="Documents">
              <Files size={18} />
            </NavIcon>
            <span>Documents</span>
          </NavLink>
        </nav>

        <div className="sidebarBottom">
          <div className="sidebarDivider" role="separator" aria-hidden="true" />

          <nav className="nav navBottom">
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'navItem active' : 'navItem')}>
              <NavIcon label="Settings">
                <Settings size={18} />
              </NavIcon>
              <span>Settings</span>
            </NavLink>

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
          <div className="topbarSearch">
            <div className="topbarSearchIcon" aria-hidden="true">
              <Search size={18} />
            </div>
            <input className="topbarSearchInput" placeholder="Search permits..." />
          </div>
          <div className="topbarRight">
            <button className="iconButton" type="button" aria-label="Help" title="Help (coming soon)">
              <CircleHelp size={18} />
            </button>

            <button
              className="iconButton"
              type="button"
              aria-label="Notifications"
              title="Notifications (coming soon)"
            >
              <Bell size={18} />
              <span className="iconDot" aria-hidden="true" />
            </button>

            <button className="profileButton" type="button" aria-label="Profile" title="Profile (coming soon)">
              <div className="profileAvatar" aria-hidden="true">
                <UserCircle2 size={22} />
              </div>
            </button>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/permit-workflow" element={<PermitWorkflowPage />} />
            <Route path="/review-status" element={<ReviewStatusPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
