import { Request, Response } from "express";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { ConversationService, MessageService } from "../services";
import { AiService, ChatTurn } from "@src/helper/aiService";
import { logApiError, sendApiError } from "@src/helper/apiLoggerUtils";
import { ApiError } from "@src/helper/apiError";

const conversationNotFound = () =>
  new ApiError(HttpStatusCodes.NOT_FOUND, "Conversation not found");

interface ISendDTO {
  userId: string;
  message: string;
  conversationId?: string;
}

/** Checks ownership and returns the AI context: recent history + new message. */
const buildContext = async ({ userId, message, conversationId }: ISendDTO) => {
  let history: ChatTurn[] = [];
  if (conversationId) {
    const existing = await ConversationService.getForUser(
      conversationId,
      userId
    );
    if (!existing) throw conversationNotFound();
    history = await MessageService.getRecent(
      conversationId,
      EnvVars.OpenRouter.ContextMessages
    );
  }
  return [
    ...history.map(({ role, content }) => ({ role, content })),
    { role: "user" as const, content: message },
  ];
};

/**
 * Persists the user message + AI reply. Called only after the AI succeeded,
 * so a failed call doesn't leave orphaned messages or empty conversations.
 */
const saveExchange = async (
  { userId, message, conversationId }: ISendDTO,
  reply: string
) => {
  const conversation = conversationId
    ? await ConversationService.getForUser(conversationId, userId)
    : await ConversationService.create(userId, message);
  if (!conversation) throw conversationNotFound();
  const id = String(conversation._id);

  const userMessage = await MessageService.create({
    conversationId: id,
    userId,
    role: "user",
    content: message,
  });
  const assistantMessage = await MessageService.create({
    conversationId: id,
    userId,
    role: "assistant",
    content: reply,
  });
  await ConversationService.touch(id);

  return {
    // Build explicitly: spreading a hydrated Mongoose document drops _id
    conversation: ConversationService.toPublic({
      _id: conversation._id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      lastMessageAt: assistantMessage.createdAt,
    }),
    userMessage: MessageService.toPublic(userMessage),
    reply: MessageService.toPublic(assistantMessage),
  };
};

const getSendDTO = (req: Request): ISendDTO => ({
  userId: req.user!.userId,
  message: req.body.message,
  conversationId: req.body.conversationId,
});

export class ChatController {
  public static async send(req: Request, res: Response) {
    try {
      const dto = getSendDTO(req);
      const context = await buildContext(dto);
      const reply = await AiService.generateReply(context);
      const data = await saveExchange(dto, reply);
      return res.send({ statusCode: HttpStatusCodes.OK, data });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }

  /**
   * Same as send, but streams the reply as server-sent events:
   *   event: token  data: { content }      (repeated)
   *   event: done   data: { conversation, userMessage, reply }
   *   event: error  data: { statusCode, message }
   */
  public static async sendStream(req: Request, res: Response) {
    const dto = getSendDTO(req);

    let context: ChatTurn[];
    try {
      // Ownership errors are returned as normal JSON, before the stream opens
      context = await buildContext(dto);
    } catch (error) {
      return sendApiError(req, res, error);
    }

    res.status(HttpStatusCodes.OK);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // Tells nginx not to buffer this response
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const sendEvent = (event: string, data: unknown) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    // Stop the AI request if the user leaves mid-reply
    const abort = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) abort.abort();
    });

    try {
      const reply = await AiService.streamReply(context, {
        signal: abort.signal,
        onToken: (content) => sendEvent("token", { content }),
      });
      const data = await saveExchange(dto, reply);
      sendEvent("done", data);
    } catch (error) {
      if (abort.signal.aborted) return;
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              HttpStatusCodes.INTERNAL_SERVER_ERROR,
              "internal server error"
            );
      if (!(error instanceof ApiError)) logApiError(req, error);
      sendEvent("error", {
        statusCode: apiError.statusCode,
        message: apiError.message,
      });
    }
    res.end();
  }

  public static async history(req: Request, res: Response) {
    try {
      const conversations = await ConversationService.listForUser(
        req.user!.userId
      );
      return res.send({
        statusCode: HttpStatusCodes.OK,
        data: conversations.map(ConversationService.toPublic),
      });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }

  public static async conversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const conversation = await ConversationService.getForUser(
        conversationId,
        req.user!.userId
      );
      if (!conversation) throw conversationNotFound();

      const messages = await MessageService.listForConversation(conversationId);
      return res.send({
        statusCode: HttpStatusCodes.OK,
        data: {
          conversation: ConversationService.toPublic(conversation),
          messages: messages.map(MessageService.toPublic),
        },
      });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }

  public static async deleteConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const deleted = await ConversationService.deleteForUser(
        conversationId,
        req.user!.userId
      );
      if (!deleted) throw conversationNotFound();

      await MessageService.deleteForConversation(conversationId);
      return res.send({
        statusCode: HttpStatusCodes.OK,
        message: "Conversation deleted",
      });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }
}
