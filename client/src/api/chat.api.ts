import { axiosClient } from './axiosClient'
import type {
  ApiResponse,
  Conversation,
  ConversationDetail,
  SendMessagePayload,
  SendMessageResult,
} from '@/types'

export const chatApi = {
  async send(payload: SendMessagePayload) {
    const { data } = await axiosClient.post<ApiResponse<SendMessageResult>>(
      '/chat/send',
      payload,
    )
    return data.data
  },

  async history() {
    const { data } = await axiosClient.get<ApiResponse<Conversation[]>>('/chat/history')
    return data.data
  },

  async conversation(conversationId: string) {
    const { data } = await axiosClient.get<ApiResponse<ConversationDetail>>(
      `/chat/history/${conversationId}`,
    )
    return data.data
  },

  async deleteConversation(conversationId: string) {
    await axiosClient.delete(`/chat/history/${conversationId}`)
  },
}
