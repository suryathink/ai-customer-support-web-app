import { Link, useNavigate } from 'react-router-dom'
import { AuthForm, AuthLayout } from '@/components/auth'
import type { AuthField } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { validators } from '@/utils/validators'

type SignupField = 'name' | 'email' | 'password'

const fields: AuthField<SignupField>[] = [
  {
    name: 'name',
    label: 'Full name',
    placeholder: 'Jane Doe',
    autoComplete: 'name',
    validate: validators.name,
  },
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
    placeholder: 'At least 8 characters',
    autoComplete: 'new-password',
    hint: 'Use 8 or more characters.',
    validate: validators.password,
  },
]

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start chatting with our AI support assistant."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <AuthForm
        fields={fields}
        submitLabel="Create account"
        onSubmit={async (values) => {
          await signup({ ...values, name: values.name.trim() })
          navigate('/', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
