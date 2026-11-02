import { Avatar } from '@/components/common'
import styles from './TypingIndicator.module.scss'

export function TypingIndicator() {
  return (
    <div className={styles.row} role="status" aria-live="polite">
      <Avatar variant="assistant" size="sm" />
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.srOnly}>Assistant is typing</span>
      </div>
    </div>
  )
}
