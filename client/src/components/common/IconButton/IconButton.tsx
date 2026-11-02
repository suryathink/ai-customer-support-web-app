import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/utils/cx'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import styles from './IconButton.module.scss'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Required for accessibility since there is no visible text */
  label: string
  variant?: 'ghost' | 'primary'
  size?: 'sm' | 'md'
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.iconButton, styles[variant], styles[size], className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 20} />
    </button>
  )
}
