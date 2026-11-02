import axios, { AxiosError } from 'axios'

/**
 * Shared axios instance. The JWT lives in an httpOnly cookie set by the API,
 * so it is never readable from JavaScript; `withCredentials` sends it along.
 */
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

let onUnauthorized: (() => void) | null = null

/** Registered by AuthProvider so an expired session logs the user out. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    if (!error.response) return 'Unable to reach the server. Check your connection.'
    return error.response.data?.message ?? fallback
  }
  return fallback
}
