import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullPageLoader } from './FullPageLoader'

/** Login/signup pages: logged-in users are sent straight to the chat. */
export function PublicRoute() {
  const { user, initializing } = useAuth()

  if (initializing) return <FullPageLoader />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
