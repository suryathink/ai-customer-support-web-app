import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/auth.api'
import { setUnauthorizedHandler } from '@/api/axiosClient'
import type { LoginPayload, SignupPayload, User } from '@/types'

export interface AuthContextValue {
  user: User | null
  /** True until the initial session check finishes */
  initializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Restore the session from the httpOnly cookie on first load
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    setUser(await authApi.login(payload))
  }, [])

  const signup = useCallback(async (payload: SignupPayload) => {
    setUser(await authApi.signup(payload))
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout }),
    [user, initializing, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
