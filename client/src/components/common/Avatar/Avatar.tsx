import { cx } from '@/utils/cx'
import { Icon } from '../Icon/Icon'
import styles from './Avatar.module.scss'

interface AvatarProps {
  /** Shows initials from the name; omit for the assistant avatar */
  name?: string
  variant?: 'user' | 'assistant'
  size?: 'sm' | 'md'
  className?: string
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export function Avatar({ name, variant = 'user', size = 'md', className }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, styles[variant], styles[size], className)} aria-hidden="true">
      {variant === 'assistant' || !name ? (
        <Icon name="bot" size={size === 'sm' ? 16 : 18} />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}
