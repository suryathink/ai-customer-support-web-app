import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { IconButton } from '@/components/common'
import { cx } from '@/utils/cx'
import styles from './ChatInput.module.scss'

export const MESSAGE_MAX_LENGTH = 2000
const MAX_TEXTAREA_HEIGHT = 200

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  /** Changing this key focuses the input, e.g. when switching conversations */
  focusKey?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message…',
  focusKey,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = value.trim()
  const remaining = MESSAGE_MAX_LENGTH - value.length
  const canSend = trimmed.length > 0 && remaining >= 0 && !disabled

  // Auto-grow the textarea with its content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [value])

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled, focusKey])

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  // Enter sends, Shift+Enter adds a new line
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <div className={cx(styles.composer, disabled && styles.disabled)}>
        <label htmlFor="chat-input" className={styles.srOnly}>
          Message
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
        />
        <IconButton
          type="submit"
          icon="send"
          label="Send message"
          variant="primary"
          disabled={!canSend}
        />
      </div>
      <div className={styles.meta}>
        <span>Press Enter to send, Shift + Enter for a new line</span>
        {remaining < 200 && (
          <span className={cx(remaining < 0 && styles.overLimit)}>{remaining}</span>
        )}
      </div>
    </form>
  )
}
