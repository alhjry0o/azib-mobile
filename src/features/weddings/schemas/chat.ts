import { z } from 'zod';
import { CHAT_MAX_LENGTH } from '../chat/message-filter';

export const ChatMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'weddings:chat.blocked.empty')
    .max(CHAT_MAX_LENGTH, 'weddings:chat.blocked.tooLong'),
});

export type ChatMessageValues = z.infer<typeof ChatMessageSchema>;
