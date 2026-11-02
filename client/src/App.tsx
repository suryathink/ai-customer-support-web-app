import { Route, Routes } from 'react-router-dom'
import { ChatPage, LoginPage, NotFoundPage, SignupPage } from '@/pages'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicRoute } from '@/routes/PublicRoute'

// Note: /auth/* and /chat/* are API paths (proxied to the server), so the
// UI uses / and /c/:conversationId for chat routes.
export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        {/* ChatPage is a layout route so it stays mounted (sidebar, typing state)
            when a new chat moves from / to /c/:id */}
        <Route element={<ChatPage />}>
          <Route index element={null} />
          <Route path="c/:conversationId" element={null} />
        </Route>
      </Route>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
