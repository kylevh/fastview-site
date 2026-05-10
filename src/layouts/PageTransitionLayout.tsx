import { Outlet, useLocation } from 'react-router-dom'

/** One transition key for all `/permit-workflow` URLs so changing record # doesn’t replay the animation. */
function routeTransitionKey(pathname: string) {
  if (pathname.startsWith('/permit-workflow')) return 'route:permit-workflow'
  return pathname === '' ? '/' : pathname
}

export function PageTransitionLayout() {
  const location = useLocation()
  const key = routeTransitionKey(location.pathname)

  return (
    <div key={key} className="pageTransition pageRouteEnter">
      <Outlet />
    </div>
  )
}
