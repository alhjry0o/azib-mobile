import { z } from 'zod';

export const AppealFormSchema = z.object({
  statement: z
    .string()
    .trim()
    .min(20, 'assistance:appeal.validation.statementMin')
    .max(2000, 'assistance:appeal.validation.statementMax'),
});

export type AppealFormValues = z.infer<typeof AppealFormSchema>;
