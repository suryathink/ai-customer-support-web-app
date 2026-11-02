import { cx } from '@/utils/cx'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <span role="status" className={cx(styles.spinner, styles[size], className)}>
      <span className={styles.label}>{label}</span>
    </span>
  )
}
