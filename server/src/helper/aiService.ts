import axios from "axios";
import { Readable } from "stream";
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

export interface ChatTurn {
  role: MessageRole;
  content: string;
}

export interface StreamOptions {
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

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

const openRouter = axios.create({
  baseURL: EnvVars.OpenRouter.BaseUrl,
  timeout: EnvVars.OpenRouter.TimeoutMs,
  headers: {
    "Content-Type": "application/json",
    "X-Title": "AI Customer Support",
  },
});

const ensureConfigured = () => {
  if (!EnvVars.OpenRouter.ApiKey) {
    throw new ApiError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      "AI service is not configured. Please set OPENROUTER_API_KEY."
    );
  }
};

const postCompletion = <T>(
  history: ChatTurn[],
  selfTopic: boolean,
  stream: boolean,
  signal?: AbortSignal
) =>
  openRouter.post<T>(
    "/chat/completions",
    {
      // OpenRouter tries these in order, falling back on errors
      models: [EnvVars.OpenRouter.Model, ...EnvVars.OpenRouter.FallbackModels],
      messages: buildMessages(history, selfTopic),
      stream,
    },
    {
      headers: {
        Authorization: `Bearer ${EnvVars.OpenRouter.ApiKey}`,
        "HTTP-Referer": EnvVars.ClientOrigin,
      },
      responseType: stream ? "stream" : "json",
      signal,
    }
  );

const logModelFallback = (model?: string) => {
  if (model && model !== EnvVars.OpenRouter.Model) {
    logger.warn(`Primary model unavailable, answered by ${model}`);
  }
};

const applyGuardrail = (question: string, reply: string) => {
  if (!isIdentityQuestion(question)) return reply;
  const guarded = enforceSelfTopicReply(reply);
  if (guarded.replaced) {
    logger.warn("Guardrail replaced a reply that revealed the model");
  }
  return guarded.reply;
};

/** Maps any OpenRouter/network failure to a client-safe ApiError. */
const toApiError = (error: unknown) => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    logger.error(
      "OpenRouter request failed:",
      error.response?.status,
      // Streamed error bodies are streams, so only log JSON bodies
      error.response?.data instanceof Readable
        ? "(stream)"
        : JSON.stringify(error.response?.data ?? error.message)
    );
    if (error.response?.status === HttpStatusCodes.TOO_MANY_REQUESTS) {
      return new ApiError(
        HttpStatusCodes.TOO_MANY_REQUESTS,
        "The AI service is busy right now. Please try again in a moment."
      );
    }
  } else {
    logger.error("OpenRouter error:", error);
  }
  return new ApiError(
    HttpStatusCodes.BAD_GATEWAY,
    "The AI assistant could not respond. Please try again."
  );
};

/**
 * Reads OpenRouter's server-sent events and calls onDelta for each text chunk.
 * Returns the model that answered.
 */
const readCompletionStream = async (
  stream: Readable,
  onDelta: (text: string) => void
) => {
  let buffer = "";
  let model: string | undefined;

  for await (const chunk of stream) {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // Blank lines separate events; ":" lines are keep-alive comments
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return model;

      const event = JSON.parse(payload);
      if (event.error) {
        throw new Error(`OpenRouter stream error: ${JSON.stringify(event.error)}`);
      }
      model = event.model ?? model;
      const text: string | undefined = event.choices?.[0]?.delta?.content;
      if (text) onDelta(text);
    }
  }
  return model;
};

export const AiService = {
  async generateReply(history: ChatTurn[]): Promise<string> {
    ensureConfigured();
    const question = history[history.length - 1]?.content ?? "";

    try {
      const { data } = await postCompletion<{
        model?: string;
        choices?: { message?: { content?: string } }[];
      }>(history, isSelfTopicQuestion(question), false);

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) throw new Error("Empty response from OpenRouter");
      logModelFallback(data.model);
      return applyGuardrail(question, reply);
    } catch (error) {
      throw toApiError(error);
    }
  },

  /**
   * Streams the reply token by token and resolves with the full text.
   * Identity questions are buffered and checked by the guardrail before
   * anything is sent, since streamed tokens can't be taken back.
   */
  async streamReply(
    history: ChatTurn[],
    { onToken, signal }: StreamOptions
  ): Promise<string> {
    ensureConfigured();
    const question = history[history.length - 1]?.content ?? "";
    const holdForGuardrail = isIdentityQuestion(question);

    try {
      const { data } = await postCompletion<Readable>(
        history,
        isSelfTopicQuestion(question),
        true,
        signal
      );

      let reply = "";
      const model = await readCompletionStream(data, (text) => {
        reply += text;
        if (!holdForGuardrail) onToken(text);
      });

      reply = reply.trim();
      if (!reply) throw new Error("Empty response from OpenRouter");
      logModelFallback(model);

      if (holdForGuardrail) {
        reply = applyGuardrail(question, reply);
        onToken(reply);
      }
      return reply;
    } catch (error) {
      if (signal?.aborted) throw error;
      throw toApiError(error);
    }
  },
};
