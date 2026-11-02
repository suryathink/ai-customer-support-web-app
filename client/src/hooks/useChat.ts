import { useCallback, useEffect, useRef, useState } from 'react'
import { chatApi } from '@/api/chat.api'
import { sendMessageStream } from '@/api/chatStream'
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

const createStreamingMessage = (): ChatMessage => ({
  id: `streaming-${Date.now()}`,
  role: 'assistant',
  content: '',
  createdAt: new Date().toISOString(),
  streaming: true,
})

export function useChat({ conversationId, onConversationUpdated }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  /** True for the whole request; the input stays disabled meanwhile */
  const [isResponding, setIsResponding] = useState(false)
  /** True until the first token arrives; shows the typing indicator */
  const [isTyping, setIsTyping] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [failedMessage, setFailedMessage] = useState<string | null>(null)

  // Set when a new conversation is created locally, so the URL change that
  // follows doesn't refetch (and flash) the messages we already have.
  const createdConversationId = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel an in-flight stream when leaving the page
  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    setSendError(null)
    setFailedMessage(null)

    if (createdConversationId.current === conversationId && conversationId) {
      createdConversationId.current = null
      return
    }

    // Switching conversations cancels a reply that is still streaming
    abortRef.current?.abort()

    if (!conversationId) {
      setMessages([])
      setLoadError(null)
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
      if (!text || isResponding) return

      const pending = createPendingMessage(text)
      const streaming = createStreamingMessage()
      const controller = new AbortController()
      abortRef.current = controller

      setMessages((prev) => [...prev, pending])
      setSendError(null)
      setFailedMessage(null)
      setIsResponding(true)
      setIsTyping(true)

      let receivedFirstToken = false
      try {
        const result = await sendMessageStream(
          { message: text, conversationId },
          {
            signal: controller.signal,
            onToken: (token) => {
              if (!receivedFirstToken) {
                receivedFirstToken = true
                setIsTyping(false)
                setMessages((prev) => [...prev, { ...streaming, content: token }])
                return
              }
              setMessages((prev) =>
                prev.map((message) =>
                  message.id === streaming.id
                    ? { ...message, content: message.content + token }
                    : message,
                ),
              )
            },
          },
        )

        // Swap the temporary messages for the saved ones
        setMessages((prev) => [
          ...prev.filter((message) => message.id !== pending.id && message.id !== streaming.id),
          result.userMessage,
          result.reply,
        ])
        const isNew = !conversationId
        if (isNew) createdConversationId.current = result.conversation.id
        onConversationUpdated?.(result.conversation, isNew)
      } catch (err) {
        if (controller.signal.aborted) return
        // Nothing was saved on the server, so drop the partial exchange
        setMessages((prev) =>
          prev.filter((message) => message.id !== pending.id && message.id !== streaming.id),
        )
        setSendError(getErrorMessage(err, 'The assistant could not respond.'))
        setFailedMessage(text)
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          setIsResponding(false)
          setIsTyping(false)
        }
      }
    },
    [conversationId, isResponding, onConversationUpdated],
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
    isResponding,
    loadError,
    sendError,
    failedMessage,
    sendMessage,
    retry,
    dismissError,
  }
}
