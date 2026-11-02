import type { ReactNode } from 'react'
import { Icon } from '@/components/common'
import styles from './AuthLayout.module.scss'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

const highlights = [
  'Instant answers, any time of day',
  'Your conversation history, saved securely',
  'Pick up right where you left off',
]

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Icon name="chat" size={22} />
          </span>
          SupportAI
        </div>
        <div className={styles.pitch}>
          <h2>Customer support that never sleeps.</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.mobileBrand}>
            <span className={styles.logo}>
              <Icon name="chat" size={20} />
            </span>
            SupportAI
          </div>
          <header className={styles.header}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
          <footer className={styles.footer}>{footer}</footer>
        </div>
      </main>
    </div>
  )
}
