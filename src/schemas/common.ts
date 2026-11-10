import { z } from 'zod';

export const IdSchema = z.string().min(1).max(200);
export const IsoDateSchema = z.string().datetime();
export const DataOriginSchema = z.enum(['demo', 'real']);
export const CurrencySchema = z.literal('YER');

export function PagedResultSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  });
}
