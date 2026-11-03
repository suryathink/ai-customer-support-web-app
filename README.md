# SupportAI: AI Customer Support Chat

A full-stack, AI-powered customer support chat app. Users sign up or log in, chat with an AI assistant (via [OpenRouter](https://openrouter.ai)) whose replies stream in token by token, and their conversation history is saved per user in MongoDB.

## Live demo

- **Frontend Deployed Link:** <https://chat.suryathink.com>
- **Backend API:** <https://chat.api.suryathink.com> (health check: [/health](https://chat.api.suryathink.com/health))

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [API](#api)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [AI setup: models, guardrail and knowledge](#ai-setup-models-guardrail-and-knowledge)
- [Deployment](#deployment)
- [Operations](#operations)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)

## Features

- **JWT authentication:** signup, login and logout. Passwords are hashed with bcrypt, and the token lives in an **httpOnly cookie** that JavaScript can't read.
- **Protected routes** on both the API and the React app.
- **Streaming AI chat:** messages go to OpenRouter with recent conversation context, and the reply streams into the chat as it's generated.
- **Model fallback:** if the primary free model is down, rate-limited or retired, OpenRouter falls back to the next one automatically.
- **Guardrail:** questions about the assistant, its LLM, this app or its creator are answered only from an approved knowledge base, and the assistant never reveals the underlying model.
- **Chat history:** conversations and messages are stored in MongoDB, scoped to each user. Past conversations are listed in a sidebar grouped by date, and you can reopen or delete them.
- **Typing indicator** until the first token arrives, then a live-updating reply bubble.
- **Rate limiting** with `express-rate-limit`: a strict limit on login/signup and a separate one on sending messages.
- **Responsive UI** in React and SCSS modules: reusable components, suggested prompts, optimistic messages, error retry, Markdown rendering of AI replies, light/dark theme.
- **Docker:** `docker compose up` runs the production build locally.
- **CI/CD:** every push to `main` deploys the backend (via Docker Hub) and the frontend to a DigitalOcean droplet.

## Tech stack

| Layer    | Tech                                                       |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, SCSS modules, Axios, Fetch streams |
| Backend  | Node.js, Express, TypeScript, Mongoose, Joi                |
| Database | MongoDB Atlas                                              |
| Auth     | JWT + bcrypt (httpOnly cookie)                             |
| AI       | OpenRouter (free models with fallback)                     |
| DevOps   | Docker, Docker Hub, GitHub Actions, nginx, Let's Encrypt, DigitalOcean |

## Project structure

```
.
├── .github/workflows/
│   ├── deploy-server.yml      # CI/CD: backend → Docker Hub → droplet
│   └── deploy-client.yml      # CI/CD: frontend build → droplet
├── client/                    # React app
│   ├── src/
│   │   ├── api/               # axios client, auth/chat API calls, chatStream (SSE reader)
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
│   │   └── types/  utils/
│   ├── Dockerfile  nginx.conf  .env.example
├── server/                    # Express API
│   ├── src/
│   │   ├── configs/           # mongo, log4js
│   │   ├── constants/         # EnvVars, HttpStatusCodes
│   │   ├── controllers/       # auth, chat (incl. streaming)
│   │   ├── helper/            # aiService (OpenRouter), guardrails, token, errors, logging
│   │   ├── knowledge/         # appKnowledge: approved facts about the app and its creator
│   │   ├── middlewares/       # authJwt, rateLimiter, validate, requestLogger
│   │   ├── models/            # User, Conversation, Message
│   │   ├── routes/            # /auth, /chat
│   │   ├── services/          # DB logic per model
│   │   ├── validations/       # Joi schemas
│   │   └── index.ts
│   ├── Dockerfile  .env.example
├── deploy/
│   ├── deploy-server.sh       # runs on the droplet: pull image, swap container, health check, rollback
│   ├── deploy-client.sh       # runs on the droplet: unpack release, atomic switch
│   └── nginx/                 # nginx site configs for the API and the app
└── docker-compose.yml         # local production-like stack
```

## API

All `/chat` routes require authentication. Responses look like `{ statusCode, data | message }`.

| Method | Endpoint                         | Description                                                  |
| ------ | -------------------------------- | ------------------------------------------------------------ |
| POST   | `/auth/signup`                   | `{ name, email, password }`: create an account and log in    |
| POST   | `/auth/login`                    | `{ email, password }`: log in                                |
| POST   | `/auth/logout`                   | Clear the session cookie                                     |
| GET    | `/auth/me`                       | Current user (used to restore the session)                   |
| POST   | `/chat/send`                     | `{ message, conversationId? }`: returns the AI reply as JSON. Leave out `conversationId` to start a new conversation. |
| POST   | `/chat/send/stream`              | Same input as `/chat/send`, but streams the reply as server-sent events. Used by the UI. |
| GET    | `/chat/history`                  | List the user's conversations (newest first)                 |
| GET    | `/chat/history/:conversationId`  | Messages of one conversation                                 |
| DELETE | `/chat/history/:conversationId`  | Delete a conversation and its messages                       |
| GET    | `/health`                        | Health check                                                 |

**Streaming format** (`/chat/send/stream`):

```
event: token
data: {"content":"Hello"}          ← repeated for each chunk of the reply

event: done
data: {"conversation":{...},"userMessage":{...},"reply":{...}}   ← saved messages

event: error
data: {"statusCode":502,"message":"..."}   ← instead of done, if the AI call fails
```

Messages are saved only after the reply completes, so a failed or cancelled reply leaves nothing half-saved. Validation, auth, rate-limit and "conversation not found" errors are returned as normal JSON before the stream starts.

**Rate limits** (configurable): `/auth/signup` and `/auth/login` allow 10 requests per 15 minutes per IP, and `/chat/send` + `/chat/send/stream` allow 20 messages per minute per IP. Over the limit, the API returns `429`.

## Running locally

### Prerequisites

- Node.js 20+ and npm
- Docker Desktop (only for the Docker option)
- A **MongoDB Atlas** cluster (free tier works). In Atlas → *Network Access*, allow your current IP.
- An **OpenRouter API key** from <https://openrouter.ai/keys> (free models work)

### 1. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env   # optional, the defaults work
```

Edit `server/.env` and set at least:

| Variable             | Value                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| `MONGO_URI`          | Your Atlas connection string                                          |
| `JWT_SECRET`         | A long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `OPENROUTER_API_KEY` | Your OpenRouter key                                                   |
| `CLIENT_ORIGIN`      | `http://localhost:5173` for option A, `http://localhost:3000` for option B |

### 2a. Option A: run without Docker (development, hot reload)

```bash
# Terminal 1: API on http://localhost:5000
cd server
npm install
npm run dev

# Terminal 2: app on http://localhost:5173
cd client
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/auth` and `/chat` to the API, so the browser sees a single origin. Set `NODE_ENV=development` in `server/.env` for this option.

### 2b. Option B: run with Docker (production build)

```bash
docker compose up --build
```

Open <http://localhost:3000>. nginx serves the React build and proxies `/auth` and `/chat` to the API container. Stop it with `docker compose down`.

> The API container runs with `NODE_ENV=production`, so the auth cookie is marked `Secure`. Browsers allow that on `localhost`; if you serve over plain HTTP on another host, set `COOKIE_SECURE=false`.

### Useful scripts

| Where    | Command             | What it does                        |
| -------- | ------------------- | ----------------------------------- |
| `server` | `npm run dev`       | Start the API with hot reload       |
| `server` | `npm run build`     | Compile TypeScript to `dist/`       |
| `server` | `npm start`         | Run the compiled API                |
| `server` | `npm run lint`      | Type-check                          |
| `client` | `npm run dev`       | Start the Vite dev server           |
| `client` | `npm run build`     | Type-check and build to `dist/`     |
| `client` | `npm run preview`   | Preview the production build        |

## Environment variables

### `server/.env`

| Variable                     | Default                                      | Description                                         |
| ---------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `NODE_ENV`                   | `development`                                | `development` or `production`                       |
| `PORT`                       | `5000`                                       | API port                                            |
| `MONGO_URI`                  | –                                            | MongoDB connection string (**required**)            |
| `CLIENT_ORIGIN`              | `http://localhost:5173`                      | Allowed CORS origin(s), comma-separated             |
| `JWT_SECRET`                 | –                                            | Secret used to sign JWTs (**required**)             |
| `JWT_EXPIRES_IN`             | `7d`                                         | Token lifetime                                      |
| `COOKIE_SECURE`              | `true` in production                         | Send the cookie over HTTPS only                     |
| `OPENROUTER_API_KEY`         | –                                            | OpenRouter API key (**required for chat**)          |
| `OPENROUTER_MODEL`           | `nvidia/nemotron-3.5-lightning:free`         | Primary model, any ID from <https://openrouter.ai/models> |
| `OPENROUTER_FALLBACK_MODELS` | `google/gemma-4-31b-it:free,openrouter/free` | Tried in order if the primary model fails           |
| `OPENROUTER_TIMEOUT_MS`      | `30000`                                      | AI request timeout                                  |
| `AI_CONTEXT_MESSAGES`        | `10`                                         | Previous messages sent as context                   |
| `AUTH_RATE_LIMIT_WINDOW_MS`  | `900000`                                     | Auth rate limit window                              |
| `AUTH_RATE_LIMIT_MAX`        | `10`                                         | Auth requests per window                            |
| `CHAT_RATE_LIMIT_WINDOW_MS`  | `60000`                                      | Chat rate limit window                              |
| `CHAT_RATE_LIMIT_MAX`        | `20`                                         | Messages per window                                 |

### `client/.env`

| Variable             | Default                 | Description                                                  |
| -------------------- | ----------------------- | ------------------------------------------------------------ |
| `VITE_API_URL`       | empty (same origin)     | API base URL. Leave empty locally; production builds use `https://chat.api.suryathink.com` |
| `VITE_DEV_API_PROXY` | `http://localhost:5000` | Where the Vite dev server proxies API calls                  |

## AI setup: models, guardrail and knowledge

**Models.** The API sends OpenRouter a list of models: `OPENROUTER_MODEL` first, then `OPENROUTER_FALLBACK_MODELS`. OpenRouter uses the first one that's available. `openrouter/free` as the last entry picks any currently free model, so chat keeps working even when specific free models are retired. When a fallback answers, the server logs `Primary model unavailable, answered by <model>`.

**Guardrail** ([server/src/helper/guardrails.ts](server/src/helper/guardrails.ts)). Questions about the assistant, its LLM, this app or its creator (e.g. "Which LLM do you use?", "What is this app?", "Who is Surya?") are detected by keyword patterns. For those:

1. The approved knowledge base is added to the prompt, with instructions to answer only from it and never name the underlying model or vendor.
2. For identity questions ("which model are you?", "who made you?"), the full reply is checked before it's sent. If it still names a model or vendor, it's replaced with a safe answer. These replies are sent in one piece instead of streamed, because streamed text can't be taken back.

Normal support questions don't get the knowledge base, so their answers aren't restricted by it.

**Editing the knowledge.** The approved facts live in [server/src/knowledge/appKnowledge.ts](server/src/knowledge/appKnowledge.ts):

- `APP_KNOWLEDGE`: what the assistant may say about the app and its creator.
- `APP_IDENTITY_FALLBACK`: the safe answer used when a reply has to be replaced.

Edit the text and push to `main`; the backend redeploys automatically. To change the suggested prompts on the welcome screen, edit `DEFAULT_SUGGESTIONS` in [client/src/components/chat/EmptyState/EmptyState.tsx](client/src/components/chat/EmptyState/EmptyState.tsx).

## Deployment

Both parts run on one DigitalOcean droplet (Ubuntu) behind its nginx, with HTTPS from Let's Encrypt:

| Part     | URL                                 | How it runs                                         |
| -------- | ----------------------------------- | --------------------------------------------------- |
| Backend  | `https://chat.api.suryathink.com`   | Docker container, listening on `127.0.0.1:5000` only |
| Frontend | `https://chat.suryathink.com`       | Static files served by nginx                        |

Both are subdomains of the same site, so the `SameSite=Strict` auth cookie works between them.

### CI/CD

| Workflow | Runs on push to `main` changing | Steps |
| -------- | ------------------------------- | ----- |
| [Deploy Backend](.github/workflows/deploy-server.yml) | `server/`, `deploy/deploy-server.sh` | Build the image and push it to Docker Hub as `suryathink/ai-customer-support-server:latest` and `:sha-<commit>` → SSH into the droplet → [deploy-server.sh](deploy/deploy-server.sh) pulls the image, replaces the container and checks `/health`. If the new container is unhealthy, it **rolls back** to the previous image and the job fails. |
| [Deploy Frontend](.github/workflows/deploy-client.yml) | `client/`, `deploy/deploy-client.sh` | `npm ci` + build with `VITE_API_URL=https://chat.api.suryathink.com` (a type error stops the deploy) → upload to the droplet → [deploy-client.sh](deploy/deploy-client.sh) unpacks it into `releases/<commit>` and **atomically** switches the live `current` symlink. The last 5 releases are kept. |

Both can be run manually from the **Actions** tab (*Run workflow*). Changes outside these paths (e.g. README) don't trigger a deploy.

**GitHub secrets** (Settings → Secrets and variables → Actions):

| Secret                | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| `DOCKER_USERNAME`     | Docker Hub username                                        |
| `DOCKER_PASSWORD`     | Docker Hub access token (Read & Write)                     |
| `DROPLET_HOST`        | Droplet IP address                                         |
| `DROPLET_USER`        | SSH user on the droplet                                    |
| `DROPLET_SSH_KEY`     | Private key of a deploy key authorized on the droplet      |
| `DROPLET_KNOWN_HOSTS` | Output of `ssh-keyscan <droplet-ip>` (host verification)   |

### First-time server setup

These steps are needed once for a new droplet. Replace `<droplet-ip>` with your droplet's IP.

**1. DNS.** Add two **A** records pointing to the droplet: `chat.api` and `chat`.

**2. Atlas.** In MongoDB Atlas → *Network Access*, add the droplet's IP.

**3. Docker** on the droplet (as root):

```bash
apt-get update && apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io
```

On a small droplet (512 MB RAM), add swap:

```bash
fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo "/swapfile none swap sw 0 0" >> /etc/fstab
```

**4. Production environment file** on the droplet, readable by root only. It is never part of the image or the repo:

```bash
mkdir -p /opt/ai-support
nano /opt/ai-support/server.env     # same variables as server/.env
chmod 600 /opt/ai-support/server.env
```

Use `NODE_ENV=production`, `CLIENT_ORIGIN=https://chat.suryathink.com`, a new random `JWT_SECRET`, your Atlas `MONGO_URI` and your `OPENROUTER_API_KEY`.

**5. nginx sites and HTTPS.** Copy the configs from [deploy/nginx/](deploy/nginx/) and issue certificates:

```bash
# on your machine
scp deploy/nginx/chat.api.suryathink.com.conf root@<droplet-ip>:/etc/nginx/sites-available/chat.api.suryathink.com
scp deploy/nginx/chat.suryathink.com.conf     root@<droplet-ip>:/etc/nginx/sites-available/chat.suryathink.com

# on the droplet
ln -sf /etc/nginx/sites-available/chat.api.suryathink.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/chat.suryathink.com /etc/nginx/sites-enabled/
mkdir -p /var/www/chat.suryathink.com/releases
nginx -t && systemctl reload nginx
certbot --nginx -d chat.api.suryathink.com -d chat.suryathink.com --redirect
```

Certbot renews the certificates automatically.

**6. Deploy key and GitHub secrets.** From the repo folder on your machine (Git Bash):

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f ~/.ssh/ai_support_deploy
cat ~/.ssh/ai_support_deploy.pub | ssh root@<droplet-ip> "cat >> ~/.ssh/authorized_keys"
gh secret set DROPLET_SSH_KEY < ~/.ssh/ai_support_deploy
ssh-keyscan <droplet-ip> | gh secret set DROPLET_KNOWN_HOSTS
gh secret set DROPLET_HOST --body <droplet-ip>
gh secret set DROPLET_USER --body root
gh secret set DOCKER_USERNAME --body <docker-hub-username>
gh secret set DOCKER_PASSWORD      # paste a Docker Hub access token
```

**7. First deploy.** Run both workflows from the **Actions** tab, or push a change to `main`.

## Operations

All commands run on the droplet.

| Task                              | Command                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| Backend logs                      | `docker logs -f ai-support-server`                          |
| Backend status                    | `docker ps`                                                 |
| Change a production setting       | Edit `/opt/ai-support/server.env`, then `docker restart ai-support-server` |
| Redeploy without a code change    | Actions tab → *Run workflow*                                |
| Roll back the backend             | `bash -s -- suryathink/ai-customer-support-server:sha-<commit> < deploy/deploy-server.sh` (from your machine via `ssh root@<droplet-ip>`), or re-run an older successful workflow run |
| Roll back the frontend            | `ln -sfn /var/www/chat.suryathink.com/releases/<commit> /var/www/chat.suryathink.com/current` |
| List frontend releases            | `ls -1t /var/www/chat.suryathink.com/releases`              |
| nginx logs                        | `tail -f /var/log/nginx/error.log`                          |

## Troubleshooting

| Symptom | Likely cause and fix |
| ------- | -------------------- |
| "The AI assistant could not respond" | OpenRouter rejected the request. Check the server logs for the OpenRouter error. A model may have been retired: update `OPENROUTER_MODEL` / `OPENROUTER_FALLBACK_MODELS`. |
| "AI service is not configured" | `OPENROUTER_API_KEY` is missing. |
| Server exits with "Could not connect to any servers in your MongoDB Atlas cluster" | The machine's IP isn't allowed in Atlas → *Network Access*. |
| Backend deploy fails at the health check | The new container didn't start; the job log prints its last 50 log lines, and the previous version keeps running. |
| Logged out immediately / login doesn't stick | `CLIENT_ORIGIN` doesn't match the app's URL, or the cookie is `Secure` on plain HTTP (set `COOKIE_SECURE=false` for HTTP-only setups). |
| Replies appear all at once instead of streaming | A proxy is buffering the response. In nginx, the `/chat/send/stream` location needs `proxy_buffering off`. |
| `429 Too Many Requests` | Rate limit hit; wait or raise the `*_RATE_LIMIT_*` values. |

## Security notes

- Passwords are hashed with bcrypt and are never returned by the API.
- The JWT is stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie, so page scripts can't read it, which protects against token theft via XSS.
- Every chat query is filtered by the authenticated user's ID, so users can only access their own conversations.
- `helmet`, CORS restricted to the app's origin, `express-mongo-sanitize` and Joi validation on all inputs.
- AI replies are rendered as Markdown without raw HTML.
- In production, secrets live only in `/opt/ai-support/server.env` on the droplet and in GitHub secrets; the API container is reachable only through nginx over HTTPS.
