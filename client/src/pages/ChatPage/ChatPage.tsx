import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatWindow } from '@/components/chat'
import { Header, Sidebar } from '@/components/layout'
import { getErrorMessage } from '@/api/axiosClient'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import type { Conversation } from '@/types'
import styles from './ChatPage.module.scss'

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const conversations = useConversations()
  const { upsert, remove } = conversations

  const handleConversationUpdated = useCallback(
    (conversation: Conversation, isNew: boolean) => {
      upsert(conversation)
      if (isNew) navigate(`/c/${conversation.id}`, { replace: true })
    },
    [upsert, navigate],
  )

  const chat = useChat({ conversationId, onConversationUpdated: handleConversationUpdated })

  const activeTitle =
    conversations.conversations.find((item) => item.id === conversationId)?.title ?? 'New conversation'

  const startNewChat = useCallback(() => {
    setSidebarOpen(false)
    navigate('/')
  }, [navigate])

  const handleDelete = useCallback(
    async (conversation: Conversation) => {
      if (!window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return
      try {
        await remove(conversation.id)
        if (conversation.id === conversationId) navigate('/', { replace: true })
      } catch (err) {
        window.alert(getErrorMessage(err, 'Could not delete the conversation.'))
      }
    },
    [remove, conversationId, navigate],
  )

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  return (
    <div className={styles.layout}>
      <Sidebar
        user={user}
        conversations={conversations.conversations}
        loading={conversations.loading}
        error={conversations.error}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onDelete={handleDelete}
        onRetry={conversations.refresh}
        onLogout={handleLogout}
      />
      <main className={styles.main}>
        <Header title={activeTitle} onMenuClick={() => setSidebarOpen(true)} onNewChat={startNewChat} />
        <ChatWindow
          conversationId={conversationId}
          messages={chat.messages}
          userName={user?.name}
          loading={chat.loading}
          isTyping={chat.isTyping}
          loadError={chat.loadError}
          sendError={chat.sendError}
          canRetry={Boolean(chat.failedMessage)}
          onSend={chat.sendMessage}
          onRetry={chat.retry}
          onDismissError={chat.dismissError}
        />
      </main>
    </div>
  )
}
