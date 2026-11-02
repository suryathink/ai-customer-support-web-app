import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import { IconButton } from '@/components/common'
import type { Conversation } from '@/types'
import { cx } from '@/utils/cx'
import styles from './ConversationItem.module.scss'

interface ConversationItemProps {
  conversation: Conversation
  onSelect?: () => void
  onDelete: (conversation: Conversation) => void
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <li className={styles.item}>
      <NavLink
        to={`/c/${conversation.id}`}
        onClick={onSelect}
        className={({ isActive }) => cx(styles.link, isActive && styles.active)}
        title={conversation.title}
      >
        {conversation.title}
      </NavLink>
      <IconButton
        icon="trash"
        size="sm"
        label={`Delete "${conversation.title}"`}
        className={styles.delete}
        onClick={() => onDelete(conversation)}
      />
    </li>
  )
})
