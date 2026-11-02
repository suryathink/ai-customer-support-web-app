import { Icon } from '@/components/common'
import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  userName?: string
  suggestions?: string[]
  onSuggestionClick: (suggestion: string) => void
  disabled?: boolean
}

const DEFAULT_SUGGESTIONS = [
  'How do I reset my password?',
  'I want to track my order',
  'How can I request a refund?',
  'What can you help me with?',
  'What is this app?',
  'Who built this app?',
  'Who is Surya?',
]

export function EmptyState({
  userName,
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
  disabled,
}: EmptyStateProps) {
  const firstName = userName?.split(' ')[0]

  return (
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon name="chat" size={28} />
      </span>
      <h2>{firstName ? `Hi ${firstName}, how can we help?` : 'How can we help?'}</h2>
      <p>Ask anything about your account, orders, billing or our products.</p>
      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className={styles.suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
