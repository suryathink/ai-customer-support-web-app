import { memo } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Avatar } from '@/components/common'
import type { ChatMessage } from '@/types'
import { cx } from '@/utils/cx'
import { formatTime } from '@/utils/date'
import styles from './MessageBubble.module.scss'

// GFM turns bare URLs and emails into links (plus tables, lists, etc.)
const remarkPlugins = [remarkGfm]

// Open web links in a new tab so the chat stays open; mailto opens the mail app
const markdownComponents: Components = {
  a: ({ href, children }) => {
    const isWebLink = /^https?:\/\//i.test(href ?? '')
    return (
      <a
        href={href}
        target={isWebLink ? '_blank' : undefined}
        rel={isWebLink ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
}

interface MessageBubbleProps {
  message: ChatMessage
  userName?: string
}

export const MessageBubble = memo(function MessageBubble({ message, userName }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cx(styles.row, isUser ? styles.user : styles.assistant)}>
      <Avatar variant={message.role} name={isUser ? userName : undefined} size="sm" />
      <div className={styles.body}>
        <div className={cx(styles.bubble, message.pending && styles.pending)}>
          {isUser ? (
            <p className={styles.plain}>{message.content}</p>
          ) : (
            // react-markdown does not render raw HTML, so AI output is safe to display
            <div className={cx(styles.markdown, message.streaming && styles.streaming)}>
              <Markdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                {message.content}
              </Markdown>
            </div>
          )}
        </div>
        {!message.streaming && (
          <time className={styles.time} dateTime={message.createdAt}>
            {message.pending ? 'Sending…' : formatTime(message.createdAt)}
          </time>
        )}
      </div>
    </div>
  )
})
