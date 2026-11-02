import axios from "axios";
import log4js from "log4js";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { MessageRole } from "@src/models";
import { ApiError } from "./apiError";

const logger = log4js.getLogger();

const SYSTEM_PROMPT = `You are a friendly and professional customer support assistant.
- Answer clearly and concisely, using short paragraphs or bullet points.
- Ask a clarifying question when the request is ambiguous.
- If you do not know something (such as order details or account data you cannot access), say so honestly and suggest how the customer can get help.
- Never invent policies, prices, or personal information.`;

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

    try {
      const { data } = await openRouter.post(
        "/chat/completions",
        {
          model: EnvVars.OpenRouter.Model,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
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
