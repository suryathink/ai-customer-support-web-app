import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Input } from '@/components/common'
import { getErrorMessage } from '@/api/axiosClient'
import styles from './AuthForm.module.scss'

export interface AuthField<TName extends string> {
  name: TName
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  hint?: string
  validate?: (value: string) => string | undefined
}

interface AuthFormProps<TName extends string> {
  fields: AuthField<TName>[]
  submitLabel: string
  onSubmit: (values: Record<TName, string>) => Promise<void>
}

/**
 * Generic form used by both login and signup: renders the fields,
 * runs per-field validation and shows server errors.
 */
export function AuthForm<TName extends string>({
  fields,
  submitLabel,
  onSubmit,
}: AuthFormProps<TName>) {
  const [values, setValues] = useState(
    () => Object.fromEntries(fields.map((f) => [f.name, ''])) as Record<TName, string>,
  )
  const [errors, setErrors] = useState<Partial<Record<TName, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const validateAll = () => {
    const next: Partial<Record<TName, string>> = {}
    for (const field of fields) {
      const error = field.validate?.(values[field.name])
      if (error) next[field.name] = error
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (name: TName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setServerError(null)
    if (!validateAll()) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setServerError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {serverError && <Alert onDismiss={() => setServerError(null)}>{serverError}</Alert>}

      {fields.map((field, index) => (
        <Input
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type ?? 'text'}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          hint={field.hint}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(e) => handleChange(field.name, e.target.value)}
          autoFocus={index === 0}
          disabled={submitting}
        />
      ))}

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
