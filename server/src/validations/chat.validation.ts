import Joi from "joi";

export const MESSAGE_MAX_LENGTH = 2000;

export const sendMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(MESSAGE_MAX_LENGTH).required(),
  conversationId: Joi.string().hex().length(24),
});
