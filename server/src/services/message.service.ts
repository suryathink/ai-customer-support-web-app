import { Message, MessageRole } from "../models";

interface ICreateMessageDTO {
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
}

export class MessageService {
  public static async create(dto: ICreateMessageDTO) {
    return await Message.create(dto);
  }

  public static async listForConversation(conversationId: string) {
    return await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .select("role content createdAt")
      .lean();
  }

  /** Most recent messages in chronological order, used as AI context. */
  public static async getRecent(conversationId: string, limit: number) {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("role content")
      .lean();
    return messages.reverse();
  }

  public static async deleteForConversation(conversationId: string) {
    await Message.deleteMany({ conversationId });
  }

  public static toPublic(message: {
    _id: unknown;
    role: MessageRole;
    content: string;
    createdAt: Date;
  }) {
    return {
      id: String(message._id),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}
