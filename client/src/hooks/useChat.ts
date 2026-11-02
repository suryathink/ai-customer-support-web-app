import { useCallback, useEffect, useRef, useState } from 'react'
import { chatApi } from '@/api/chat.api'
import { getErrorMessage } from '@/api/axiosClient'
import type { ChatMessage, Conversation } from '@/types'

interface UseChatOptions {
  conversationId?: string
  /** Called after a reply arrives, e.g. to update the sidebar and URL */
  onConversationUpdated?: (conversation: Conversation, isNew: boolean) => void
}

const createPendingMessage = (content: string): ChatMessage => ({
  id: `pending-${Date.now()}`,
  role: 'user',
  content,
  createdAt: new Date().toISOString(),
  pending: true,
})

export function useChat({ conversationId, onConversationUpdated }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [failedMessage, setFailedMessage] = useState<string | null>(null)

  // Set when a new conversation is created locally, so the URL change that
  // follows doesn't refetch (and flash) the messages we already have.
  const createdConversationId = useRef<string | null>(null)

  useEffect(() => {
    setSendError(null)
    setFailedMessage(null)

    if (!conversationId) {
      setMessages([])
      setLoadError(null)
      return
    }
    if (createdConversationId.current === conversationId) {
      createdConversationId.current = null
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadError(null)
    chatApi
      .conversation(conversationId)
      .then(({ messages: loaded }) => !cancelled && setMessages(loaded))
      .catch((err) => {
        if (cancelled) return
        setMessages([])
        setLoadError(getErrorMessage(err, 'Could not load this conversation.'))
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text || isTyping) return

      const pending = createPendingMessage(text)
      setMessages((prev) => [...prev, pending])
      setSendError(null)
      setFailedMessage(null)
      setIsTyping(true)

      try {
        const result = await chatApi.send({ message: text, conversationId })
        setMessages((prev) => [
          ...prev.filter((message) => message.id !== pending.id),
          result.userMessage,
          result.reply,
        ])
        const isNew = !conversationId
        if (isNew) createdConversationId.current = result.conversation.id
        onConversationUpdated?.(result.conversation, isNew)
      } catch (err) {
        setMessages((prev) => prev.filter((message) => message.id !== pending.id))
        setSendError(getErrorMessage(err, 'The assistant could not respond.'))
        setFailedMessage(text)
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId, isTyping, onConversationUpdated],
  )

  const retry = useCallback(() => {
    if (failedMessage) sendMessage(failedMessage)
  }, [failedMessage, sendMessage])

  const dismissError = useCallback(() => {
    setSendError(null)
    setFailedMessage(null)
  }, [])

  return {
    messages,
    loading,
    isTyping,
    loadError,
    sendError,
    failedMessage,
    sendMessage,
    retry,
    dismissError,
  }
}
