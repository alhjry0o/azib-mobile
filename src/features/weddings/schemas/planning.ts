import { z } from 'zod';
import { IdSchema, IsoDateSchema } from '@/schemas/common';
import { BUDGET_CATEGORIES } from '@/repositories/contracts/wedding-budget';

const Money = z.number().int().nonnegative();

export const CreatePollSchema = z.object({
  questionKey: z.string().min(1, 'weddings:validation.question'),
  kind: z.enum(['date', 'venue', 'other']),
  options: z
    .array(z.object({ id: IdSchema, labelKey: z.string().min(1) }))
    .min(2, 'weddings:validation.options'),
  deadline: IsoDateSchema,
  quorumPercent: z.number().int().min(1).max(100),
  tieBreak: z.enum(['organizer_vote', 'option_order']),
});

export const BudgetItemSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES),
  labelKey: z.string().min(1, 'weddings:validation.label'),
  amount: Money.refine((v) => v > 0, 'weddings:validation.amount'),
  scope: z.enum(['shared', 'individual']),
  memberId: IdSchema.nullable(),
  offerId: IdSchema.nullable(),
});

export const SplitConfigSchema = z.object({
  mode: z.enum(['equal', 'weighted', 'custom']),
  weights: z.array(z.object({ memberId: IdSchema, weight: z.number().int().positive() })),
  customShares: z.array(z.object({ memberId: IdSchema, amount: Money })),
});

export const ServiceRequestSchema = z.object({
  partnerId: IdSchema,
  categoryKey: z.string().min(1),
  message: z.string().trim().min(1, 'weddings:validation.message').max(500),
});

export type CreatePollValues = z.infer<typeof CreatePollSchema>;
export type BudgetItemValues = z.infer<typeof BudgetItemSchema>;
export type SplitConfigValues = z.infer<typeof SplitConfigSchema>;
export type ServiceRequestValues = z.infer<typeof ServiceRequestSchema>;
