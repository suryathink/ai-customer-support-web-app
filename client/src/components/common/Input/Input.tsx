import { useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '@/utils/cx'
import { Icon } from '../Icon/Icon'
import styles from './Input.module.scss'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

/** Labelled text input with inline error and a show/hide toggle for passwords. */
export function Input({ label, error, hint, type = 'text', id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={cx(styles.control, error && styles.hasError)}>
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
