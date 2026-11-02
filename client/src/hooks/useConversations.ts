import { useCallback, useEffect, useState } from 'react'
import { chatApi } from '@/api/chat.api'
import { getErrorMessage } from '@/api/axiosClient'
import type { Conversation } from '@/types'

/** Sidebar list of the user's past conversations. */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setConversations(await chatApi.history())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your conversations.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** Insert or update a conversation and move it to the top. */
  const upsert = useCallback((conversation: Conversation) => {
    setConversations((prev) => [
      conversation,
      ...prev.filter((item) => item.id !== conversation.id),
    ])
  }, [])

  const remove = useCallback(async (conversationId: string) => {
    await chatApi.deleteConversation(conversationId)
    setConversations((prev) => prev.filter((item) => item.id !== conversationId))
  }, [])

  return { conversations, loading, error, refresh, upsert, remove }
}
