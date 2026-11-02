import type { ReactNode } from 'react'
import { cx } from '@/utils/cx'
import { Icon } from '../Icon/Icon'
import styles from './Alert.module.scss'

interface AlertProps {
  children: ReactNode
  /** Optional action, e.g. a retry button */
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}

export function Alert({ children, action, onDismiss, className }: AlertProps) {
  return (
    <div role="alert" className={cx(styles.alert, className)}>
      <Icon name="alert" size={18} className={styles.icon} />
      <div className={styles.message}>{children}</div>
      {action}
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  )
}
