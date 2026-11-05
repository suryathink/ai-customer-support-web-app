import { APP_IDENTITY_FALLBACK, APP_KNOWLEDGE } from "@src/knowledge/appKnowledge";

// Questions about the assistant's identity or its LLM
const IDENTITY_PATTERNS: RegExp[] = [
  /\b(llms?|large language models?|language models?|ai models?)\b/i,
  /\b(gpt|chatgpt|openai|gemini|llama|mistral|nemotron|gemma|qwen|deepseek|openrouter|hugging ?face)\b/i,
  /\bwhich (ai|model|llm|engine)\b/i,
  /\bwhat (ai|model|llm)\b/i,
  /\b(your|ur) (model|ai|brain|engine)\b/i,
  /\b(who|what) (are|r) (you|u)\b/i,
  // "who built you" can surface the vendor; "who built this app" is a creator question
  /\b(who|which company) (made|built|created|trained|developed|owns) (you|u)\b/i,
  /\bare (you|u) (an? )?(ai|bot|robot|human|real)\b/i,
  /\b(powered|running|run) (by|on|with)\b/i,
];

// Questions about what this application is, does, or how it's built
const APP_PATTERNS: RegExp[] = [
  /\bwhat(?: is|'s|s) (this|the) (app|application|project|chatbot|website|site|platform|bot|tool)\b/i,
  /\bwhat can (you|u) do\b/i,
  /\bhow (do|does) (you|u|this (app|chat|bot|assistant)) work\b/i,
  /\b(tech|technology) stack\b/i,
  /\b(this|the) (app|application|project|chatbot|website|platform)\b.*\b(built|made|work|stack|features?|tech)\b/i,
];

// Questions about the person who built the app (e.g. from recruiters)
const CREATOR_PATTERNS: RegExp[] = [
  /\b(who|which (person|developer|engineer|team))\b.*\b(made|built|created|developed|designed|wrote|coded)\b/i,
  /\b(developer|creator|author|builder|engineer|maker)s?\b.*\b(of|behind|who)\b/i,
  /\babout (the )?(developer|creator|author|builder|engineer|maker)\b/i,
  /\bsurya\b/i,
  /\b(hire|hiring|recruit\w*|portfolio)\b/i,
  /\b(salary|compensation|ctc|lpa|notice period|expected pay)\b/i,
  /\b(his|your (creator|developer)'?s?|the (creator|developer)'?s?) (resume|cv|linkedin|github)\b/i,
  /\b(contact|reach|email) (the )?(developer|creator|author|him)\b/i,
  /\b(his|the developer'?s|the creator'?s) (experience|skills|projects|work|background)\b/i,
];

export const isIdentityQuestion = (message: string) =>
  IDENTITY_PATTERNS.some((pattern) => pattern.test(message));

export const isSelfTopicQuestion = (message: string) =>
  isIdentityQuestion(message) ||
  [...APP_PATTERNS, ...CREATOR_PATTERNS].some((pattern) => pattern.test(message));

// Vendor/model names that are not part of the official reference.
// If a self-topic answer mentions one, the model ignored the guardrail.
const UNAPPROVED_IDENTITY_PATTERN =
  /\b(nvidia|nemotron|google|gemma|gemini|meta|llama|openai|gpt-?\d|chatgpt|mistral|mixtral|qwen|alibaba|deepseek|microsoft|phi-?\d|cohere|xai|grok)\b/i;

export const GUARDRAIL_SYSTEM_PROMPT = `GUARDRAIL - the user is asking about you, your LLM/AI model, this application, or the person who built it:
- Answer ONLY with facts from the APP FACTS below. Do not use outside knowledge.
- Never name or guess the specific underlying model, its vendor, or its training (for example: do not say you are GPT, Llama, Gemini, Nemotron, etc.). If asked, say responses are generated through OpenRouter.ai, which supports many open LLMs.
- If the APP FACTS do not contain the answer, say you don't have that information.
- Speak naturally in the first person, as if you simply know these facts. Never say "reference", "document", "documentation", "facts", "available information", "provided information", "APP FACTS", or that you were given any text.

When the question is about the creator (who built this, the developer, Surya, hiring, his experience or skills):
- Introduce Surya Prakash Singh warmly and confidently, like a proud teammate, never like a sales pitch.
- Lead with his most impressive, concrete results (with numbers), then tailor the rest to what was asked.
- Keep it scannable: one short intro sentence, 3-5 bullets, then a closing line inviting them to connect, with his portfolio, resume and LinkedIn links.
- Never invent or exaggerate anything beyond the APP FACTS, and never share a phone number.

APP FACTS:
"""
${APP_KNOWLEDGE}
"""`;

/** Extra reminder placed right before a self-topic question. */
export const SELF_TOPIC_REMINDER =
  "The next question is about you, your AI model, this application, or its creator. Follow the GUARDRAIL strictly: answer only from the APP FACTS, never name a specific model or vendor, and never mention where your information comes from.";

/**
 * Last line of defence for identity questions: if the answer still reveals an
 * unapproved model/vendor, replace it with a safe answer built from the reference.
 */
export const enforceSelfTopicReply = (reply: string) =>
  UNAPPROVED_IDENTITY_PATTERN.test(reply)
    ? { reply: APP_IDENTITY_FALLBACK, replaced: true }
    : { reply, replaced: false };
