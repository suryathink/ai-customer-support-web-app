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

// How close to the bottom (px) still counts as "following" the conversation
const STICK_THRESHOLD = 120

export function MessageList({ messages, isTyping, userName, footer }: MessageListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const previousCount = useRef(messages.length)

  // Only auto-scroll while the user is at the bottom, so they can scroll up
  // to read earlier messages while a reply streams in.
  const handleScroll = () => {
    const el = scrollerRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
  }

  useEffect(() => {
    const isNewMessage = messages.length !== previousCount.current
    previousCount.current = messages.length
    if (isNewMessage) stickToBottom.current = true
    if (!stickToBottom.current) return
    // Smooth for new messages; instant while tokens stream in to avoid jank
    endRef.current?.scrollIntoView({ behavior: isNewMessage ? 'smooth' : 'auto', block: 'end' })
  }, [messages, isTyping, footer])

  return (
    <div className={styles.scroller} ref={scrollerRef} onScroll={handleScroll}>
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
