import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CircleHelp, LogIn } from 'lucide-react'

type OpenPanel = 'notifications' | 'login' | null

export function TopBarMenus() {
  const [open, setOpen] = useState<OpenPanel>(null)
  const [loginBusy, setLoginBusy] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const loginBusyTimerRef = useRef(0)

  function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.clearTimeout(loginBusyTimerRef.current)
    setLoginBusy(true)
    loginBusyTimerRef.current = window.setTimeout(() => {
      loginBusyTimerRef.current = 0
      setLoginBusy(false)
    }, 900)
  }

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const el = wrapRef.current
      if (!el?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.clearTimeout(loginBusyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="topbarMenus" ref={wrapRef}>
      <div className="topbarMenuWrap">
        <button
          type="button"
          className={`iconButton${open === 'notifications' ? ' iconButtonActive' : ''}`}
          aria-expanded={open === 'notifications'}
          aria-haspopup="dialog"
          aria-controls="topbar-notifications-panel"
          onClick={() => setOpen((v) => (v === 'notifications' ? null : 'notifications'))}
        >
          <Bell size={18} />
        </button>
        {open === 'notifications' ? (
          <div
            id="topbar-notifications-panel"
            className="topbarPopover"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="topbarPopoverHeader">Notifications</div>
            <div className="topbarPopoverBody topbarPopoverEmpty">No notifications yet.</div>
          </div>
        ) : null}
      </div>

      <Link
        className="iconButton"
        to="/support"
        aria-label="Support"
        title="Support"
        onClick={() => setOpen(null)}
      >
        <CircleHelp size={18} />
      </Link>

      <div className="topbarMenuWrap">
        <button
          type="button"
          className={`topbarLoginTrigger${open === 'login' ? ' topbarLoginTriggerActive' : ''}`}
          aria-expanded={open === 'login'}
          aria-haspopup="dialog"
          aria-controls="topbar-login-panel"
          onClick={() => setOpen((v) => (v === 'login' ? null : 'login'))}
        >
          <LogIn size={18} aria-hidden="true" />
          <span className="topbarLoginTriggerLabel">Log in</span>
        </button>
        {open === 'login' ? (
          <div id="topbar-login-panel" className="topbarPopover" role="dialog" aria-label="Log in">
            <div className="topbarPopoverHeader">Log in</div>
            <div className="topbarPopoverBody">
              <form className="topbarLoginForm" onSubmit={handleLoginSubmit} noValidate>
                <div className="topbarLoginField">
                  <label className="topbarLoginLabel" htmlFor="topbar-login-user">
                    Username
                  </label>
                  <input
                    id="topbar-login-user"
                    className="topbarLoginInput"
                    type="text"
                    name="username"
                    autoComplete="username"
                  />
                </div>
                <div className="topbarLoginField">
                  <label className="topbarLoginLabel" htmlFor="topbar-login-pass">
                    Password
                  </label>
                  <input
                    id="topbar-login-pass"
                    className="topbarLoginInput"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="topbarLoginSubmit" disabled={loginBusy}>
                  {loginBusy ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
