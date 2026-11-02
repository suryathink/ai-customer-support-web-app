import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullPageLoader } from './FullPageLoader'

/** Only renders child routes for logged-in users. */
export function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
