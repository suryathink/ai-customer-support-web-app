import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage } from '@/types'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { TypingIndicator } from '../TypingIndicator/TypingIndicator'
import styles from './MessageList.module.scss'

interface MessageListProps {
  messages: ChatMessage[]
  isTyping: boolean
  userName?: string
  /** Rendered below the last message, e.g. a send error with retry */
  footer?: ReactNode
}

export function MessageList({ messages, isTyping, userName, footer }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the newest message (or the typing indicator) in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping, footer])

  return (
    <div className={styles.scroller}>
      <div className={styles.list} role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} userName={userName} />
        ))}
        {isTyping && <TypingIndicator />}
        {footer}
        <div ref={endRef} />
      </div>
    </div>
  )
}
