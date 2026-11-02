# SupportAI: AI Customer Support Chat

A full-stack, AI-powered customer support chat app. Users sign up or log in, chat with an AI assistant (via [OpenRouter](https://openrouter.ai)), and their conversation history is saved per user in MongoDB.

## Features

- **JWT authentication:** signup, login and logout. Passwords are hashed with bcrypt, and the token is stored in an **httpOnly cookie** (not readable by JavaScript).
- **Protected routes** on both the API and the React app.
- **AI chat with streaming:** messages are sent to OpenRouter along with recent conversation context, and the reply streams into the chat token by token.
- **Chat history:** conversations and messages are stored in MongoDB, scoped to each user. Past conversations are listed in a sidebar grouped by date, and you can reopen or delete them.
- **Typing indicator** while the assistant is replying.
- **Rate limiting** with `express-rate-limit`: a strict limit on auth endpoints and a separate one on sending messages.
- Responsive UI built with React and SCSS modules: optimistic messages, error retry, Markdown rendering of AI replies, light/dark theme.
- **Dockerized:** `docker compose up` runs the production build (nginx serving the React app plus the compiled API) against your MongoDB Atlas database.

## Tech stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, SCSS modules, Axios   |
| Backend  | Node.js, Express, TypeScript, Mongoose, Joi       |
| Database | MongoDB Atlas                                     |
| Auth     | JWT + bcrypt (httpOnly cookie)                    |
| AI       | OpenRouter (any model, free models supported)     |
| DevOps   | Docker, Docker Compose, nginx                     |

## Project structure

```
.
├── client/                    # React app
│   ├── src/
│   │   ├── api/               # axios client + auth/chat API calls
│   │   ├── components/
│   │   │   ├── common/        # Button, Input, IconButton, Alert, Avatar, Spinner, Icon
│   │   │   ├── auth/          # AuthLayout, AuthForm
│   │   │   ├── chat/          # ChatWindow, MessageList, MessageBubble, ChatInput, TypingIndicator, EmptyState
│   │   │   └── layout/        # Sidebar, ConversationItem, Header
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useAuth, useChat, useConversations
│   │   ├── pages/             # Login, Signup, Chat, NotFound
│   │   ├── routes/            # ProtectedRoute, PublicRoute
│   │   ├── styles/            # SCSS tokens, mixins, theme, reset
│   │   ├── types/  utils/
│   ├── Dockerfile  nginx.conf  .env.example
├── server/                    # Express API
│   ├── src/
│   │   ├── configs/           # mongo, log4js
│   │   ├── constants/         # EnvVars, HttpStatusCodes
│   │   ├── controllers/       # auth, chat
│   │   ├── helper/            # aiService (OpenRouter), token, errors, logging
│   │   ├── middlewares/       # authJwt, rateLimiter, validate, requestLogger
│   │   ├── models/            # User, Conversation, Message
│   │   ├── routes/            # /auth, /chat
│   │   ├── services/          # DB logic per model
│   │   ├── validations/       # Joi schemas
│   │   └── index.ts
│   ├── Dockerfile  .env.example
└── docker-compose.yml
```

## API

All `/chat` routes require authentication. Responses look like `{ statusCode, data | message }`.

| Method | Endpoint                         | Description                                                  |
| ------ | -------------------------------- | ------------------------------------------------------------ |
| POST   | `/auth/signup`                   | `{ name, email, password }`: create an account and log in    |
| POST   | `/auth/login`                    | `{ email, password }`: log in                                |
| POST   | `/auth/logout`                   | Clear the session cookie                                     |
| GET    | `/auth/me`                       | Current user (used to restore the session)                   |
| POST   | `/chat/send`                     | `{ message, conversationId? }`: returns the AI reply. Leave out `conversationId` to start a new conversation. |
| POST   | `/chat/send/stream`              | Same as `/chat/send`, but streams the reply as server-sent events (`token` events, then `done` with the saved messages). Used by the UI. |
| GET    | `/chat/history`                  | List the user's conversations (newest first)                 |
| GET    | `/chat/history/:conversationId`  | Messages of one conversation                                 |
| DELETE | `/chat/history/:conversationId`  | Delete a conversation and its messages                       |
| GET    | `/health`                        | Health check                                                 |

**Rate limits** (configurable in `.env`): `/auth/signup` and `/auth/login` allow 10 requests per 15 min per IP, and `/chat/send` allows 20 messages per minute per IP. When a limit is hit, the API returns `429`.

## Getting started

### Prerequisites

- Node.js 20+ and npm (for running without Docker)
- Docker Desktop (for the Docker setup)
- An OpenRouter API key: create one at <https://openrouter.ai/keys> (free models work)

### 1. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env   # optional, the defaults work
```

Edit `server/.env` and set at least:

- `OPENROUTER_API_KEY`: your OpenRouter key
- `JWT_SECRET`: a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `MONGO_URI`: your **MongoDB Atlas** connection string
- `CLIENT_ORIGIN`: the URL the app is served from (`http://localhost:3000` with Docker)

### 2a. Run with Docker

```bash
docker compose up --build
```

- App: <http://localhost:3000> (nginx serves the React build and proxies `/auth` and `/chat` to the API)

Stop it with `docker compose down`.

> The API runs with `NODE_ENV=production`, so the auth cookie is marked `Secure` and only works over HTTPS. `localhost` is exempt. If you serve over plain HTTP on another host, set `COOKIE_SECURE=false`.

### 2b. Run without Docker (local development)

```bash
# API
cd server
npm install
npm run dev          # http://localhost:5000

# Client (in another terminal)
cd client
npm install
npm run dev          # http://localhost:5173
```

The Vite dev server proxies `/auth` and `/chat` to the API, so the browser sees a single origin.

## Environment variables

### `server/.env`

| Variable                     | Default                                   | Description                                         |
| ---------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `NODE_ENV`                   | `development`                             | `development` or `production`                       |
| `PORT`                       | `5000`                                    | API port                                            |
| `MONGO_URI`                  | –                                         | MongoDB connection string (**required**)            |
| `CLIENT_ORIGIN`              | `http://localhost:5173`                   | Allowed CORS origin(s), comma-separated             |
| `JWT_SECRET`                 | –                                         | Secret used to sign JWTs (**required**)             |
| `JWT_EXPIRES_IN`             | `7d`                                      | Token lifetime                                      |
| `COOKIE_SECURE`              | `true` in production                      | Send the cookie over HTTPS only                     |
| `OPENROUTER_API_KEY`         | –                                         | OpenRouter API key (**required for chat**)          |
| `OPENROUTER_MODEL`           | `nvidia/nemotron-3.5-lightning:free`  | Any model ID from <https://openrouter.ai/models>    |
| `OPENROUTER_FALLBACK_MODELS` | `google/gemma-4-31b-it:free,openrouter/free` | Tried in order if the primary model fails (`openrouter/free` picks any available free model) |
| `OPENROUTER_TIMEOUT_MS`      | `30000`                                   | AI request timeout                                  |
| `AI_CONTEXT_MESSAGES`        | `10`                                      | Previous messages sent as context                   |
| `AUTH_RATE_LIMIT_WINDOW_MS`  | `900000`                                  | Auth rate limit window                              |
| `AUTH_RATE_LIMIT_MAX`        | `10`                                      | Auth requests per window                            |
| `CHAT_RATE_LIMIT_WINDOW_MS`  | `60000`                                   | Chat rate limit window                              |
| `CHAT_RATE_LIMIT_MAX`        | `20`                                      | Messages per window                                 |

### `client/.env`

| Variable             | Default                 | Description                                                       |
| -------------------- | ----------------------- | ----------------------------------------------------------------- |
| `VITE_API_URL`       | empty (same origin)     | Set only when the API is hosted on a different domain            |
| `VITE_DEV_API_PROXY` | `http://localhost:5000` | Where the Vite dev server proxies API calls                       |

## Security notes

- Passwords are hashed with bcrypt and are never returned by the API.
- The JWT is stored in an `httpOnly`, `SameSite=Strict` cookie, so page scripts can't read it, which protects against token theft via XSS.
- Every chat query is filtered by the authenticated user's ID, so users can only access their own conversations.
- `helmet`, CORS restricted to the client origin, `express-mongo-sanitize` and Joi validation on all inputs.
- AI replies are rendered as Markdown without raw HTML.
