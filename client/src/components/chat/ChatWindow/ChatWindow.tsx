import { Alert, Button, Icon, Spinner } from '@/components/common'
import type { ChatMessage } from '@/types'
import { ChatInput } from '../ChatInput/ChatInput'
import { EmptyState } from '../EmptyState/EmptyState'
import { MessageList } from '../MessageList/MessageList'
import styles from './ChatWindow.module.scss'

interface ChatWindowProps {
  conversationId?: string
  messages: ChatMessage[]
  userName?: string
  loading: boolean
  isTyping: boolean
  loadError: string | null
  sendError: string | null
  canRetry: boolean
  onSend: (message: string) => void
  onRetry: () => void
  onDismissError: () => void
}

export function ChatWindow({
  conversationId,
  messages,
  userName,
  loading,
  isTyping,
  loadError,
  sendError,
  canRetry,
  onSend,
  onRetry,
  onDismissError,
}: ChatWindowProps) {
  const errorFooter = sendError && (
    <Alert
      onDismiss={onDismissError}
      action={
        canRetry && (
          <Button size="sm" variant="secondary" leftIcon={<Icon name="refresh" size={16} />} onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {sendError}
    </Alert>
  )

  const renderBody = () => {
    if (loading) {
      return (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading conversation" />
        </div>
      )
    }
    if (loadError) {
      return (
        <div className={styles.center}>
          <Alert>{loadError}</Alert>
        </div>
      )
    }
    if (messages.length === 0 && !isTyping) {
      return (
        <>
          <EmptyState userName={userName} onSuggestionClick={onSend} disabled={isTyping} />
          {errorFooter && <div className={styles.emptyError}>{errorFooter}</div>}
        </>
      )
    }
    return (
      <MessageList messages={messages} isTyping={isTyping} userName={userName} footer={errorFooter} />
    )
  }

  return (
    <section className={styles.window}>
      {renderBody()}
      <ChatInput
        onSend={onSend}
        disabled={isTyping || loading || Boolean(loadError)}
        focusKey={conversationId ?? 'new'}
      />
    </section>
  )
}
