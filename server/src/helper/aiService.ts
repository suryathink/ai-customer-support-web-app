import axios from "axios";
import log4js from "log4js";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { MessageRole } from "@src/models";
import { ApiError } from "./apiError";
import {
  GUARDRAIL_SYSTEM_PROMPT,
  SELF_TOPIC_REMINDER,
  enforceSelfTopicReply,
  isIdentityQuestion,
  isSelfTopicQuestion,
} from "./guardrails";

const logger = log4js.getLogger();

const SYSTEM_PROMPT = `You are a friendly and professional customer support assistant.
- Answer clearly and concisely, using short paragraphs or bullet points.
- Ask a clarifying question when the request is ambiguous.
- If you do not know something (such as order details or account data you cannot access), say so honestly and suggest how the customer can get help.
- Never invent policies, prices, or personal information.
- Never name or guess the specific AI model or vendor behind you.`;

/**
 * Normal questions get the support prompt only. Questions about the assistant,
 * its LLM or this app also get the guardrail + app facts and a reminder.
 */
const buildMessages = (history: ChatTurn[], selfTopic: boolean) => {
  if (!selfTopic) {
    return [{ role: "system", content: SYSTEM_PROMPT }, ...history];
  }
  const earlier = history.slice(0, -1);
  const latest = history.slice(-1);
  return [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${GUARDRAIL_SYSTEM_PROMPT}` },
    ...earlier,
    { role: "system", content: SELF_TOPIC_REMINDER },
    ...latest,
  ];
};

export interface ChatTurn {
  role: MessageRole;
  content: string;
}

const openRouter = axios.create({
  baseURL: EnvVars.OpenRouter.BaseUrl,
  timeout: EnvVars.OpenRouter.TimeoutMs,
  headers: {
    "Content-Type": "application/json",
    "X-Title": "AI Customer Support",
  },
});

export const AiService = {
  async generateReply(history: ChatTurn[]): Promise<string> {
    if (!EnvVars.OpenRouter.ApiKey) {
      throw new ApiError(
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        "AI service is not configured. Please set OPENROUTER_API_KEY."
      );
    }

    const question = history[history.length - 1]?.content ?? "";
    const selfTopic = isSelfTopicQuestion(question);

    try {
      const { data } = await openRouter.post(
        "/chat/completions",
        {
          // OpenRouter tries these in order, falling back on errors
          models: [
            EnvVars.OpenRouter.Model,
            ...EnvVars.OpenRouter.FallbackModels,
          ],
          messages: buildMessages(history, selfTopic),
        },
        {
          headers: {
            Authorization: `Bearer ${EnvVars.OpenRouter.ApiKey}`,
            "HTTP-Referer": EnvVars.ClientOrigin,
          },
        }
      );

      const reply: string | undefined = data?.choices?.[0]?.message?.content;
      if (!reply?.trim()) {
        throw new Error("Empty response from OpenRouter");
      }
      if (data.model && data.model !== EnvVars.OpenRouter.Model) {
        logger.warn(`Primary model unavailable, answered by ${data.model}`);
      }

      if (isIdentityQuestion(question)) {
        const guarded = enforceSelfTopicReply(reply.trim());
        if (guarded.replaced) {
          logger.warn("Guardrail replaced a reply that revealed the model");
        }
        return guarded.reply;
      }
      return reply.trim();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          "OpenRouter request failed:",
          error.response?.status,
          JSON.stringify(error.response?.data ?? error.message)
        );
        if (error.response?.status === HttpStatusCodes.TOO_MANY_REQUESTS) {
          throw new ApiError(
            HttpStatusCodes.TOO_MANY_REQUESTS,
            "The AI service is busy right now. Please try again in a moment."
          );
        }
      } else {
        logger.error("OpenRouter error:", error);
      }
      throw new ApiError(
        HttpStatusCodes.BAD_GATEWAY,
        "The AI assistant could not respond. Please try again."
      );
    }
  },
};
