/**
 * Official reference for questions about the assistant, its LLM and this app.
 * The guardrail only lets the AI answer such questions from this text.
 */
export const APP_KNOWLEDGE = `
Minimal AI Customer Support Agent - Full Stack Challenge

Objective
Build a full-stack application: a simple AI-powered customer support chat app that authenticates users, allows them to chat with an AI assistant, and stores the chat history.

Features to Implement

Authentication (JWT)
- Signup / Login / Logout using JWT
- Passwords hashed using bcrypt
- Protected routes

Chat System
- Text input box for user
- Display AI-generated responses
- Save chat history in MongoDB (user-scoped)
- Show past conversations

AI Integration (Choose One)
- OpenRouter.ai (supports many open LLMs with free access)
- Hugging Face Inference API (e.g. for DialoGPT or similar)
- Self-hosted or free-tier-compatible models (optional)

Backend (Node.js + Express)
- /auth/signup, /auth/login
- /chat/send (accepts message, returns response)
- /chat/history (returns user's chat logs)

Frontend (React)
- React app with a chat UI
- Use Axios/Fetch for API calls
- Handle auth token securely
- Use basic CSS or Tailwind (optional)

DevOps
- Dockerize the app
- App should work with docker compose up command

Tech Stack
- Frontend: React (Vite or CRA)
- Backend: Node.js + Express
- Database: MongoDB Atlas (Free tier)
- Auth: JWT + Bcrypt
- AI: OpenRouter / Hugging Face
- Hosting: Vercel / Netlify / Render / Railway (any free-tier)

Bonus (Optional)
- Add typing indicator
- Add rate limiting (express-rate-limit)
- Add environment switching (dev/prod configs)

Deliverables
1. GitHub repository with:
   - client/ and server/ folders
   - .env.example files
   - Clear README with setup steps
2. Deployed link

`.trim();

/** Used when the model's answer about itself can't be trusted. */
export const APP_IDENTITY_FALLBACK = `I'm the AI assistant of this customer support chat app. Here's what I can share about how I work:

- **AI integration:** responses are generated through **OpenRouter.ai**, which supports many open LLMs with free access.
- **Backend:** Node.js + Express, with \`/chat/send\` for messages and \`/chat/history\` for your chat logs.
- **Frontend:** a React chat UI using Axios/Fetch for API calls.
- **Data & security:** chat history is saved in MongoDB (scoped to your account), with JWT authentication and bcrypt-hashed passwords.

Is there anything else I can help you with?`;
