export interface User {
  id: string
  name: string
  email: string
}

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  /** Client-only: message shown optimistically before the server confirms it */
  pending?: boolean
  /** Client-only: assistant reply that is still streaming in */
  streaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  lastMessageAt: string
  createdAt: string
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message?: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SendMessagePayload {
  message: string
  conversationId?: string
}

export interface SendMessageResult {
  conversation: Conversation
  userMessage: ChatMessage
  reply: ChatMessage
}

export interface ConversationDetail {
  conversation: Conversation
  messages: ChatMessage[]
}
