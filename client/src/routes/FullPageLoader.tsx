import { Spinner } from '@/components/common'

export function FullPageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-primary)',
      }}
    >
      <Spinner size="lg" />
    </div>
  )
}
