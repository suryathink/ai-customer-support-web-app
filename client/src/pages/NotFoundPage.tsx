import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common'
import styles from './NotFoundPage.module.scss'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      <span className={styles.code}>404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for doesn&apos;t exist or was moved.</p>
      <Button onClick={() => navigate('/', { replace: true })}>Back to chat</Button>
    </main>
  )
}
