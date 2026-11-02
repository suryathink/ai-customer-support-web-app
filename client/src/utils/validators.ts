const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validators = {
  name: (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Name is required'
    if (trimmed.length < 2) return 'Name must be at least 2 characters'
    return undefined
  },
  email: (value: string) => {
    if (!value.trim()) return 'Email is required'
    if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address'
    return undefined
  },
  password: (value: string) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (value.length > 72) return 'Password must be at most 72 characters'
    return undefined
  },
  required: (label: string) => (value: string) =>
    value ? undefined : `${label} is required`,
}
