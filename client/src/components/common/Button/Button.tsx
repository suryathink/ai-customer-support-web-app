import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/utils/cx'
import { Spinner } from '../Spinner/Spinner'
import styles from './Button.module.scss'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" label="Please wait" /> : leftIcon}
      {children && <span>{children}</span>}
    </button>
  )
}
