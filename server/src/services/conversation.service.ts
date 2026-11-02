import { isValidObjectId } from "mongoose";
import { Conversation } from "../models";

const TITLE_MAX_LENGTH = 60;

export class ConversationService {
  public static buildTitle(firstMessage: string) {
    const clean = firstMessage.trim().replace(/\s+/g, " ");
    return clean.length > TITLE_MAX_LENGTH
      ? `${clean.slice(0, TITLE_MAX_LENGTH - 1)}…`
      : clean;
  }

  public static async create(userId: string, firstMessage: string) {
    return await Conversation.create({
      userId,
      title: ConversationService.buildTitle(firstMessage),
    });
  }

  /** Returns the conversation only if it belongs to the user. */
  public static async getForUser(conversationId: string, userId: string) {
    if (!isValidObjectId(conversationId)) return null;
    return await Conversation.findOne({ _id: conversationId, userId }).lean();
  }

  public static async listForUser(userId: string) {
    return await Conversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .select("title lastMessageAt createdAt")
      .lean();
  }

  public static async touch(conversationId: string) {
    await Conversation.updateOne(
      { _id: conversationId },
      { lastMessageAt: new Date() }
    );
  }

  public static async deleteForUser(conversationId: string, userId: string) {
    if (!isValidObjectId(conversationId)) return null;
    return await Conversation.findOneAndDelete({ _id: conversationId, userId });
  }

  public static toPublic(conversation: {
    _id: unknown;
    title: string;
    lastMessageAt?: Date | null;
    createdAt: Date;
  }) {
    return {
      id: String(conversation._id),
      title: conversation.title,
      lastMessageAt: conversation.lastMessageAt ?? conversation.createdAt,
      createdAt: conversation.createdAt,
    };
  }
}
