import { z } from 'zod';
import { RATING_MAX, RATING_MIN, RATING_NOTE_MAX } from '../state/handover';

export const SoukRequestSchema = z.object({
  reason: z.string().trim().min(10, 'marketplace:souk.validation.reason').max(500),
});

export const HandoverConfirmSchema = z.object({
  code: z.string().trim().min(6, 'marketplace:souk.validation.handoverCode').max(40),
});

export const ExperienceRatingSchema = z.object({
  score: z.number().int().min(RATING_MIN).max(RATING_MAX),
  note: z.string().trim().max(RATING_NOTE_MAX).nullable(),
});

export const SoukMessageSchema = z.object({
  text: z.string().trim().min(1, 'marketplace:souk.validation.message').max(500),
});

export type SoukRequestValues = z.infer<typeof SoukRequestSchema>;
export type HandoverConfirmValues = z.infer<typeof HandoverConfirmSchema>;
export type ExperienceRatingValues = z.infer<typeof ExperienceRatingSchema>;
export type SoukMessageValues = z.infer<typeof SoukMessageSchema>;
