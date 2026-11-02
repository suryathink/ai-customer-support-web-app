import { IconButton } from '@/components/common'
import styles from './Header.module.scss'

interface HeaderProps {
  title: string
  onMenuClick: () => void
  onNewChat: () => void
}

export function Header({ title, onMenuClick, onNewChat }: HeaderProps) {
  return (
    <header className={styles.header}>
      <IconButton icon="menu" label="Open conversations" className={styles.mobileOnly} onClick={onMenuClick} />
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.status}>
          <span className={styles.statusDot} />
          AI assistant online
        </span>
      </div>
      <IconButton icon="plus" label="New chat" className={styles.mobileOnly} onClick={onNewChat} />
    </header>
  )
}
