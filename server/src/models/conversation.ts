import { Schema, model, InferSchemaType } from "mongoose";

const conversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, lastMessageAt: -1 });

export type IConversation = InferSchemaType<typeof conversationSchema>;

export const Conversation = model("Conversation", conversationSchema);
