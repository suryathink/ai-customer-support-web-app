import { APP_IDENTITY_FALLBACK, APP_KNOWLEDGE } from "@src/knowledge/appKnowledge";

// Questions about the assistant's identity or its LLM
const IDENTITY_PATTERNS: RegExp[] = [
  /\b(llms?|large language models?|language models?|ai models?)\b/i,
  /\b(gpt|chatgpt|openai|gemini|llama|mistral|nemotron|gemma|qwen|deepseek|openrouter|hugging ?face)\b/i,
  /\bwhich (ai|model|llm|engine)\b/i,
  /\bwhat (ai|model|llm)\b/i,
  /\b(your|ur) (model|ai|brain|engine)\b/i,
  /\b(who|what) (are|r) (you|u)\b/i,
  /\b(who|which company) (made|built|created|trained|developed|owns) (you|u|this)\b/i,
  /\bare (you|u) (an? )?(ai|bot|robot|human|real)\b/i,
  /\b(powered|running|run) (by|on|with)\b/i,
];

// Questions about how this application is built or what it does
const APP_PATTERNS: RegExp[] = [
  /\bhow (do|does) (you|u|this (app|chat|bot|assistant)) work\b/i,
  /\b(tech|technology) stack\b/i,
  /\b(this|the) (app|application|project|chatbot|website|platform)\b.*\b(built|made|work|stack|features?|tech)\b/i,
];

export const isIdentityQuestion = (message: string) =>
  IDENTITY_PATTERNS.some((pattern) => pattern.test(message));

export const isSelfTopicQuestion = (message: string) =>
  isIdentityQuestion(message) ||
  APP_PATTERNS.some((pattern) => pattern.test(message));

// Vendor/model names that are not part of the official reference.
// If a self-topic answer mentions one, the model ignored the guardrail.
const UNAPPROVED_IDENTITY_PATTERN =
  /\b(nvidia|nemotron|google|gemma|gemini|meta|llama|openai|gpt-?\d|chatgpt|mistral|mixtral|qwen|alibaba|deepseek|microsoft|phi-?\d|cohere|xai|grok)\b/i;

export const GUARDRAIL_SYSTEM_PROMPT = `GUARDRAIL - the user is asking about you, your LLM/AI model, or this application:
- Answer ONLY with facts from the APP FACTS below. Do not use outside knowledge.
- Never name or guess the specific underlying model, its vendor, or its training (for example: do not say you are GPT, Llama, Gemini, Nemotron, etc.). If asked, say responses are generated through OpenRouter.ai, which supports many open LLMs.
- If the APP FACTS do not contain the answer, say you don't have that information.
- Speak naturally in the first person, as if you simply know these facts. Never say "reference", "document", "documentation", "provided information", "APP FACTS", or that you were given any text.

APP FACTS:
"""
${APP_KNOWLEDGE}
"""`;

/** Extra reminder placed right before a self-topic question. */
export const SELF_TOPIC_REMINDER =
  "The next question is about you, your AI model, or this application. Follow the GUARDRAIL strictly: answer only from the APP FACTS, never name a specific model or vendor, and never mention where your information comes from.";

/**
 * Last line of defence for identity questions: if the answer still reveals an
 * unapproved model/vendor, replace it with a safe answer built from the reference.
 */
export const enforceSelfTopicReply = (reply: string) =>
  UNAPPROVED_IDENTITY_PATTERN.test(reply)
    ? { reply: APP_IDENTITY_FALLBACK, replaced: true }
    : { reply, replaced: false };
