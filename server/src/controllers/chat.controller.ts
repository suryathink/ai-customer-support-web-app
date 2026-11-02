import { Request, Response } from "express";
import EnvVars from "@src/constants/EnvVars";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { ConversationService, MessageService } from "../services";
import { AiService, ChatTurn } from "@src/helper/aiService";
import { sendApiError } from "@src/helper/apiLoggerUtils";
import { ApiError } from "@src/helper/apiError";

const conversationNotFound = () =>
  new ApiError(HttpStatusCodes.NOT_FOUND, "Conversation not found");

export class ChatController {
  public static async send(req: Request, res: Response) {
    try {
      const { userId } = req.user!;
      const { message, conversationId } = req.body as {
        message: string;
        conversationId?: string;
      };

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

      // Ask the AI first so a failed call doesn't leave orphaned messages
      const reply = await AiService.generateReply([
        ...history.map(({ role, content }) => ({ role, content })),
        { role: "user", content: message },
      ]);

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

      return res.send({
        statusCode: HttpStatusCodes.OK,
        data: {
          conversation: ConversationService.toPublic({
            ...conversation,
            lastMessageAt: assistantMessage.createdAt,
          }),
          userMessage: MessageService.toPublic(userMessage),
          reply: MessageService.toPublic(assistantMessage),
        },
      });
    } catch (error) {
      return sendApiError(req, res, error);
    }
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
