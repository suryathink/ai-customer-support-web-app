
/**
 * Official reference for questions about the assistant, its LLM,
 * this app and its creator.
 *
 * The guardrail only lets the AI answer questions about the app
 * and its creator using this knowledge base.
 */

export const APP_KNOWLEDGE = `
ABOUT THIS APP

App Name
Minimal AI Customer Support Agent

Objective
A full-stack application that provides an AI-powered customer
support chat experience. Users can authenticate, interact with
an AI assistant and access their saved chat history.

Core Features
- User authentication and authorization.
- AI-powered customer support conversations.
- Persistent chat history.
- LLM integration through OpenRouter.ai.
- Context-aware AI responses using a configured knowledge base.
- Retrieval-Augmented Generation (RAG) for knowledge retrieval.


ABOUT THE CREATOR

This application was designed and built by Surya Prakash Singh.

Who He Is
- Backend-heavy Full Stack Engineer with approximately 3.2 years
  of professional software development experience.
- Most recently worked as Software Development Engineer II
  (SDE II) at Visit Health.
- Previously worked as a Software Development Engineer at
  Diatoz (flowwork.ai).
- Experienced in building production-grade applications,
  revenue-critical healthcare systems and real-time platforms.
- Strongest expertise lies in backend engineering.
- Experienced in designing APIs, database architectures,
  real-time communication systems and third-party integrations.
- Interested in distributed systems, scalable architectures
  and AI-powered applications.
- Based in India.
- Open to backend and full-stack engineering opportunities
  in Bengaluru, NCR and remote locations.

Professional Identity
Surya primarily identifies as a backend engineer who can
also independently develop and maintain frontend applications.

His strongest professional experience includes:
- Backend application development.
- Node.js and TypeScript.
- NestJS and Express.js.
- REST API architecture.
- Real-time communication.
- Database design and optimization.
- Third-party API integrations.
- Event-driven systems.
- Production debugging and system reliability.
- LLM-powered applications and RAG systems.


PROFESSIONAL EXPERIENCE

VISIT HEALTH
Role: Software Development Engineer II (SDE II)
Period: September 2025 - October 2026

Visit Health is a healthcare technology platform.

Major Responsibilities and Achievements

1. Cashless Dental Module
- Contributed to the development and enhancement of the
  Cashless Dental module, a major revenue-generating product
  at Visit Health.
- Took end-to-end ownership of major components involving
  appointment booking, wallet deductions, payments,
  OTP verification and partner integrations.
- Worked across patient, doctor, clinic and operations
  workflows.
- Supported more than 25,000 appointments monthly.
- Worked on payment and copayment collection workflows
  integrated with existing wallet functionality.

2. Prescription Automation
- Implemented automated prescription approval and rejection
  notifications.
- Reduced support tickets by approximately 50%.
- Improved communication between healthcare operations
  teams and patients.

3. Booking Experience
- Developed React.js booking, wallet and OTP screens.
- Improved booking-flow completion time by approximately 40%.
- Reduced OTP-related drop-offs by approximately 50%.

4. Multi-channel Communication System
- Built a centralized communications dashboard supporting
  Email, SMS, WhatsApp and Push notifications.
- Automated communication workflows and status tracking.
- Reduced manual status-checking efforts by approximately 80%.

5. FitPass Integration
- Integrated FitPass partner APIs for gym discovery,
  session booking, reviews and cancellations.
- Supported approximately 10,000 monthly bookings.
- Developed frontend features for corporate fitness benefits,
  including dependent plans and gym discovery.

6. Aditya Birla Health Insurance Integration
- Integrated Aditya Birla Health Insurance APIs.
- Automated health checkup-related notifications.
- Reduced manual operational overhead by approximately 70%.

7. Doctor-Patient Call Management
- Architected and developed a doctor-patient call
  management system.
- Implemented interaction history and missed-call analytics.
- Reduced missed follow-ups by approximately 80%.


DIATOZ (FLOWWORK.AI)
Role: Software Development Engineer
Previous Role: Software Development Intern

Major Project: Real-time Messaging Platform

- Engineered a Slack-inspired real-time messaging platform
  from scratch using Node.js, Socket.io and MongoDB.
- Built backend services supporting more than 5,000 users.
- Handled over 50,000 messages daily.
- Supported more than 500 channels.
- Supported approximately 2,500 concurrent connections.
- Implemented direct messaging and group conversations.
- Developed channel-based communication.
- Implemented typing indicators and online presence.
- Built role-based channel permissions.
- Implemented polling functionality.
- Integrated instant video calling.
- Worked on React web and React Native mobile clients.
- Developed real-time communication features using
  WebSockets and Socket.io.

Internship Project: Mentorship Platform

- Built a mentorship platform using Next.js.
- Developed features supporting student and mentor workflows.
- The platform generated more than 150 student enrollments
  monthly.


TECHNICAL SKILLS

Programming Languages
- JavaScript
- TypeScript
- SQL

Frontend Development
- React.js
- Next.js
- React Native
- Redux Toolkit
- Context API
- HTML
- CSS
- Tailwind CSS
- Material UI
- Bootstrap

Backend Development
- Node.js
- Express.js
- NestJS
- REST APIs
- WebSockets
- Socket.io
- Authentication and Authorization
- Role-Based Access Control
- API Integration
- Backend Service Architecture

Databases
- MongoDB
- PostgreSQL
- MySQL
- Redis
- Firestore

ORMs and Database Tools
- Mongoose
- Prisma
- Drizzle ORM
- Sequelize
- TypeORM

Messaging and Event Processing
- Apache Kafka
- RabbitMQ
- Redis Pub/Sub
- Publish-Subscribe Architecture
- Asynchronous Processing
- Event-Driven Communication

Cloud and DevOps
- AWS EC2
- AWS S3
- AWS RDS
- AWS CloudFront
- AWS Route53
- AWS VPC
- Docker
- Linux
- CI/CD
- Git and GitHub

AI AND LLM ENGINEERING

- Large Language Model APIs.
- OpenAI APIs and OpenRouter.ai.
- Retrieval-Augmented Generation (RAG).
- LangChain.js.
- Vector databases including Qdrant, Pinecone and pgvector.
- Embeddings and semantic search.
- PDF ingestion and document processing.
- Prompt engineering.
- Function calling and tool use.
- AI agents.
- Model Context Protocol (MCP).
- Streaming LLM responses.
- Context management and retrieval pipelines.
- AI-powered application development.

AI-ASSISTED DEVELOPMENT

- Familiar with AI-assisted software development workflows.
- Interested in Spec-Driven Development (SDD).
- Explores AI-augmented development lifecycle (AI-DLC).
- Uses AI tools to accelerate coding, debugging,
  architecture exploration and development workflows.
- Interested in improving developer productivity through
  AI-powered engineering tools.


BACKEND ENGINEERING EXPERTISE

API Development
- Designing and developing RESTful APIs.
- Structuring modular backend applications.
- Implementing authentication and authorization.
- Integrating external APIs and third-party services.
- Handling request validation and centralized error handling.
- Designing reusable services and middleware.

Database Engineering
- Relational and document-based database modeling.
- MongoDB schema design.
- PostgreSQL relational modeling.
- Database indexing and query optimization.
- Transactions and data consistency.
- ORM-based database interactions.
- Managing relationships between entities.

Real-time Engineering
- WebSocket communication.
- Socket.io.
- Real-time messaging.
- Online presence and typing indicators.
- Message delivery and read receipts.
- Concurrent connection handling.
- Real-time notifications.

Performance and Reliability
- API performance optimization.
- Efficient database queries.
- Caching strategies.
- Error handling and retry mechanisms.
- Idempotent operations.
- Production debugging.
- Application scalability and reliability.


SYSTEM DESIGN AND ARCHITECTURE

Surya has worked with production systems and has explored
different distributed system architecture patterns.

Areas of knowledge and interest include:

- Monolithic architecture.
- Microservices architecture.
- Event-driven architecture.
- Distributed systems.
- Service-to-service communication.
- Publish-Subscribe architecture.
- Message queues.
- CQRS (Command Query Responsibility Segregation).
- Event Sourcing.
- Transactional Outbox Pattern.
- Database transactions.
- Idempotency.
- Retry mechanisms.
- Failure handling.
- Distributed caching.
- Horizontal scaling.
- Load balancing.
- API design and versioning.
- WebSocket architecture.
- System reliability and fault tolerance.

He is particularly interested in understanding the trade-offs
between architectural approaches and selecting appropriate
solutions based on application requirements.

Note: Some architecture concepts represent technical knowledge
and learning interests rather than claims of production
implementation experience.


PROJECTS AND SIDE PROJECTS

1. AI Image Generator

- Developed a full-stack MERN application that generates
  images from text prompts.
- Integrated an LLM/image generation API.
- Implemented image generation workflows.
- Built a community gallery.
- Implemented pagination and infinite scrolling.
- Worked on frontend and backend integration.

Technology Stack:
React.js, Node.js, Express.js, MongoDB and AI APIs.

2. Chat Backend

- Developed a one-to-one messaging service.
- Used strict TypeScript.
- Implemented PostgreSQL and Firestore integration.
- Worked on ordered message delivery.
- Implemented read receipts.
- Focused on reliable message persistence and delivery.

Technology Stack:
Node.js, TypeScript, PostgreSQL and Firestore.

3. Chat With Your PDFs

- Developed an experimental RAG application.
- Implemented PDF ingestion and document processing.
- Generated embeddings from document content.
- Stored vector embeddings in Qdrant.
- Used LangChain.js for retrieval workflows.
- Enabled users to ask questions about uploaded documents.
- Generated context-aware answers using retrieved content.

Technology Stack:
Node.js, LangChain.js, Qdrant, embeddings and LLM APIs.


ENGINEERING APPROACH

- Prefers understanding the underlying problem before
  implementing a solution.
- Focuses on maintainable, modular and scalable code.
- Values proper API contracts and database design.
- Considers error handling and failure scenarios during
  backend development.
- Interested in understanding architectural trade-offs.
- Believes in taking ownership of features from design
  through implementation and deployment.
- Values production reliability and performance.
- Uses AI-assisted development to accelerate coding
  and debugging.
- Continuously explores new technologies and engineering
  practices.


CAREER PREFERENCES

Target Roles
- Backend Engineer.
- Node.js Developer.
- Full Stack Engineer.
- Backend-heavy Full Stack Developer.
- Software Development Engineer.

Preferred Technical Stack
- Node.js.
- TypeScript.
- NestJS.
- PostgreSQL.
- MongoDB.
- Redis.
- Kafka.
- Microservices.
- Distributed Systems.
- AWS.

Career Interests
- Backend-heavy engineering roles.
- Scalable backend applications.
- Distributed systems.
- Real-time communication platforms.
- Healthcare technology.
- AI-powered applications.
- LLM engineering and RAG.
- Product engineering.

Preferred Locations
- Bengaluru.
- Delhi NCR.
- Remote opportunities.

Company Preferences
- Interested in both startups and established product companies.
- Open to Indian and international opportunities.
- Comfortable working across different time zones.

Compensation, notice period and availability are not shared here.
For these, recruiters should contact Surya directly by email or LinkedIn.


EDUCATION

Bachelor of Science (B.Sc.)
University of Calcutta
2019 - 2022
Honours: Zoology

Full Stack Web Development
Masai School

- Completed more than 1,000 hours of coding.
- Built more than 80 mini projects.
- Completed four major full-stack projects.
- Studied MERN stack development and software engineering.


PERSONAL DEVELOPMENT AND LEARNING INTERESTS

Surya continuously explores technologies and concepts
to strengthen his software engineering skills.

Current and recurring learning interests include:

- Advanced TypeScript.
- NestJS.
- Next.js.
- React Native.
- Microservices architecture.
- Kafka.
- RabbitMQ.
- Redis.
- PostgreSQL.
- Drizzle ORM.
- Distributed systems.
- System design.
- RAG and AI agents.
- MCP.
- LangChain.js.
- D3.js.
- Docker and AWS.
- Puppeteer.


CONTACT INFORMATION

Name: Surya Prakash Singh

Portfolio:
https://suryathink.com

Resume:
https://drive.google.com/file/d/1ygWAIYhIHOE3YraevbYZbtWGt6c1Js4T/view

LinkedIn:
https://www.linkedin.com/in/suryathink/

GitHub:
https://github.com/suryathink

Email:
suryaprakashsingh110@gmail.com


IMPORTANT KNOWLEDGE BASE INSTRUCTIONS

1. This knowledge base is the official source of information
   about Surya Prakash Singh and this application.

2. Do not invent professional experience, projects,
   achievements, metrics, technical skills or qualifications.

3. Do not confuse technologies Surya has explored or studied
   with technologies he has used extensively in production.

4. When answering questions about professional experience,
   prioritize actual work experience at Visit Health and Diatoz.

5. When answering architecture questions, distinguish between
   hands-on implementation experience and theoretical
   understanding or learning interests.

6. Do not claim that Surya independently built or owned an
   entire project unless explicitly stated.

7. Do not invent missing employment dates, compensation,
   availability or personal information.

8. For questions unrelated to this application or its creator,
   respond normally using the assistant's general capabilities
   and any relevant retrieved context.
`.trim();


/**
 * Used when the model's answer about itself can't be trusted.
 */
export const APP_IDENTITY_FALLBACK = `
I'm the AI assistant of this customer support chat application.

You can sign in, chat with me and access your saved conversation
history whenever you return.

My responses are generated through OpenRouter.ai, which provides
access to multiple large language models.

ABOUT THE CREATOR

This application was designed and built by Surya Prakash Singh,
a backend-heavy Full Stack Engineer with approximately 3.2 years
of professional experience.

He has worked as an SDE II at Visit Health and previously
as an SDE at Diatoz (flowwork.ai).

His primary expertise includes Node.js, TypeScript, NestJS,
REST APIs, PostgreSQL, MongoDB, real-time systems,
distributed architecture and AI-powered applications.

You can learn more about him here:

Portfolio: https://suryathink.com
LinkedIn: https://www.linkedin.com/in/suryathink/
GitHub: https://github.com/suryathink/

Is there anything else I can help you with?
`.trim();
