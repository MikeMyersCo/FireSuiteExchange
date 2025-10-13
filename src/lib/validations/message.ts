import { z } from 'zod';

export const sendMessageSchema = z.object({
  listingId: z.string(),
  body: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message cannot exceed 1000 characters'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
