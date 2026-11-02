import { ApiRequestError, notifyUnauthorized } from './axiosClient'
import type { SendMessagePayload, SendMessageResult } from '@/types'

interface StreamHandlers {
  /** Called with each chunk of reply text as it arrives */
  onToken: (text: string) => void
  signal?: AbortSignal
}

const parseEvent = (raw: string) => {
  let event = 'message'
  let data = ''
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data += line.slice(5).trim()
  }
  return { event, data: data ? JSON.parse(data) : null }
}

/**
 * Sends a message and streams the AI reply (server-sent events over POST).
 * Uses fetch because axios can't read a response stream in the browser.
 * Resolves with the saved conversation and messages once the reply is complete.
 */
export async function sendMessageStream(
  payload: SendMessagePayload,
  { onToken, signal }: StreamHandlers,
): Promise<SendMessageResult> {
  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/chat/send/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(payload),
    signal,
  })

  // Validation, auth, rate-limit and ownership errors come back as plain JSON
  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null)
    if (response.status === 401) notifyUnauthorized()
    throw new ApiRequestError(response.status, body?.message ?? 'Something went wrong.')
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value

    // Events are separated by a blank line
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const { event, data } = parseEvent(buffer.slice(0, boundary))
      buffer = buffer.slice(boundary + 2)
      boundary = buffer.indexOf('\n\n')

      if (event === 'token') onToken(data.content)
      else if (event === 'done') return data as SendMessageResult
      else if (event === 'error') throw new ApiRequestError(data.statusCode, data.message)
    }
  }

  throw new ApiRequestError(502, 'The connection was interrupted. Please try again.')
}
