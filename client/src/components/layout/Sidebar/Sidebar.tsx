import { useMemo } from 'react'
import { Alert, Avatar, Button, Icon, IconButton, Spinner } from '@/components/common'
import type { Conversation, User } from '@/types'
import { cx } from '@/utils/cx'
import { getDateGroup } from '@/utils/date'
import { ConversationItem } from '../ConversationItem/ConversationItem'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  user: User | null
  conversations: Conversation[]
  loading: boolean
  error: string | null
  open: boolean
  onClose: () => void
  onNewChat: () => void
  onDelete: (conversation: Conversation) => void
  onRetry: () => void
  onLogout: () => void
}

const groupConversations = (conversations: Conversation[]) => {
  const groups = new Map<string, Conversation[]>()
  for (const conversation of conversations) {
    const label = getDateGroup(conversation.lastMessageAt)
    groups.set(label, [...(groups.get(label) ?? []), conversation])
  }
  return [...groups.entries()]
}

export function Sidebar({
  user,
  conversations,
  loading,
  error,
  open,
  onClose,
  onNewChat,
  onDelete,
  onRetry,
  onLogout,
}: SidebarProps) {
  const groups = useMemo(() => groupConversations(conversations), [conversations])

  const renderList = () => {
    if (loading && conversations.length === 0) {
      return (
        <div className={styles.state}>
          <Spinner size="sm" label="Loading conversations" />
        </div>
      )
    }
    if (error) {
      return (
        <Alert
          className={styles.error}
          action={
            <Button size="sm" variant="ghost" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )
    }
    if (conversations.length === 0) {
      return <p className={styles.state}>No conversations yet. Start one!</p>
    }
    return groups.map(([label, items]) => (
      <div key={label} className={styles.group}>
        <h3 className={styles.groupLabel}>{label}</h3>
        <ul className={styles.list}>
          {items.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onSelect={onClose}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </div>
    ))
  }

  return (
    <>
      <div className={cx(styles.backdrop, open && styles.backdropVisible)} onClick={onClose} />
      <aside className={cx(styles.sidebar, open && styles.open)} aria-label="Conversations">
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logo}>
              <Icon name="chat" size={18} />
            </span>
            SupportAI
          </div>
          <IconButton icon="close" label="Close sidebar" className={styles.closeButton} onClick={onClose} />
        </div>

        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Icon name="plus" size={18} />}
          onClick={onNewChat}
          className={styles.newChat}
        >
          New chat
        </Button>

        <nav className={styles.history}>{renderList()}</nav>

        {user && (
          <div className={styles.account}>
            <Avatar name={user.name} size="sm" />
            <div className={styles.accountInfo}>
              <span className={styles.accountName}>{user.name}</span>
              <span className={styles.accountEmail}>{user.email}</span>
            </div>
            <IconButton icon="logout" label="Log out" onClick={onLogout} />
          </div>
        )}
      </aside>
    </>
  )
}
