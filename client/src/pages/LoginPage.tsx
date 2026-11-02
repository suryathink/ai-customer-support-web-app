import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthForm, AuthLayout } from '@/components/auth'
import type { AuthField } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { validators } from '@/utils/validators'

type LoginField = 'email' | 'password'

const fields: AuthField<LoginField>[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    autoComplete: 'email',
    validate: validators.email,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Your password',
    autoComplete: 'current-password',
    validate: validators.required('Password'),
  },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your conversations."
      footer={
        <>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </>
      }
    >
      <AuthForm
        fields={fields}
        submitLabel="Log in"
        onSubmit={async (values) => {
          await login(values)
          navigate(redirectTo, { replace: true })
        }}
      />
    </AuthLayout>
  )
}
