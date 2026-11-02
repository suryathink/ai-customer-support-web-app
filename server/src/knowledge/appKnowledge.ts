/**
 * Official reference for questions about the assistant, its LLM, this app
 * and its creator. The guardrail only lets the AI answer such questions from
 * this text.
 */
export const APP_KNOWLEDGE = `
ABOUT THIS APP
Minimal AI Customer Support Agent

Objective
A full-stack application: a simple AI-powered customer support chat app that authenticates users, allows them to chat with an AI assistant, and stores the chat history.

ABOUT THE CREATOR
This app was designed and built by Surya Prakash Singh.

Who he is
- Full Stack Engineer with 3.2 years of experience building revenue-critical, real-time systems that run in production, mostly in healthcare tech.
- Most recently Software Development Engineer II (SDE II) at Visit Health; previously SDE at Diatoz (flowwork.ai).
- Based in Bengaluru, India. Open to backend and full-stack roles in Bangalore, NCR or remote.
- Strengths: TypeScript, Node.js, NestJS, REST APIs, real-time and event-driven systems, and LLM-powered features.

Highlights and impact
- Sole owner of the Cashless Dental module, Visit Health's primary revenue product: led it end to end (appointment booking, wallet deduction, payments, OTP verification and partner integrations) across patients, doctors, clinics and ops teams, processing 25,000+ appointments a month.
- Cut support tickets by 50% with proactive prescription approval/rejection notifications.
- Built React.js booking, wallet and OTP screens that cut booking-flow completion time by 40% and OTP-related drop-off by 50%.
- Built a multi-channel communications dashboard (Email, SMS, WhatsApp, Push) that cut the ops team's manual status checks by 80%.
- Integrated FitPass partner APIs (gym discovery, session booking, reviews) supporting 10,000+ bookings a month, and Aditya Birla Health Insurance APIs that reduced manual ops overhead by 70%.
- Architected a doctor-patient call management system that reduced missed follow-ups by 80%.
- At Diatoz, engineered a Slack-inspired real-time messaging platform from scratch (Node.js, Socket.io, MongoDB) for 5,000+ users, handling 50,000+ messages a day across 500+ channels, with typing indicators and online presence for 2,500+ concurrent connections, role-based channel permissions, polls and instant video calls; plus React web and React Native mobile clients.
- As an intern at Diatoz, built a Next.js mentorship platform that brought in 150+ student enrollments a month.

Skills
- Languages: JavaScript, TypeScript, SQL
- Frontend: React.js, Next.js, React Native, Redux Toolkit, Context API, HTML, CSS
- Backend: Node.js, Express.js, NestJS, REST APIs, Socket.io, WebSockets
- Databases: MongoDB, PostgreSQL, MySQL
- AI & LLM engineering: LLM APIs, LangChain.js, RAG, vector databases (pgvector, Pinecone, Qdrant), embeddings, prompt engineering, function calling / tool use, MCP, AI agents, streaming LLM responses
- AI-assisted development: Spec-Driven Development (SDD) and an AI-augmented development lifecycle (AI-DLC)
- DevOps: Docker, Linux, AWS
- Concepts: real-time systems, event-driven architecture, scalable system design

Side projects
- Chat backend: a 1:1 messaging service in strict TypeScript with PostgreSQL and Firestore, read receipts and ordered delivery.
- AI image generator: a full-stack MERN app that turns text prompts into images, with a community gallery.
- Chat with your PDFs: a RAG experiment that indexes PDFs into a Qdrant vector store and answers questions over them with LangChain.

Education
- Full Stack Web Development (MERN) at Masai School: 1,000+ hours of coding and 80+ projects.
- B.Sc. from the University of Calcutta (2019 - 2022).

How to reach him
- Portfolio: https://suryathink.com
- Resume: https://drive.google.com/file/d/1ygWAIYhIHOE3YraevbYZbtWGt6c1Js4T/view
- LinkedIn: https://www.linkedin.com/in/suryathink/
- GitHub: https://github.com/suryathink
- Email: suryaprakashsingh110@gmail.com
`.trim();

/** Used when the model's answer about itself can't be trusted. */
export const APP_IDENTITY_FALLBACK = `I'm the AI assistant of this customer support chat app. You can sign in, chat with me, and your chat history is saved so you can come back to past conversations. My responses are generated through **OpenRouter.ai**, which supports many open LLMs.

This app was built by **Surya Prakash Singh**, a full stack engineer with 3.2 years of experience building real-time, production systems. You can find more about him at [suryathink.com](https://suryathink.com) or on [LinkedIn](https://www.linkedin.com/in/suryathink/).

Is there anything else I can help you with?`;
