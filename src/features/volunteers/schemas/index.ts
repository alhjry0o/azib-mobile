import { z } from 'zod';
import { IdSchema } from '@/schemas/common';
import { VolunteerHelpTypeSchema } from '@/schemas/volunteer';
import { AVAILABILITY_CELLS, RATING_MAX, RATING_MIN, RATING_NOTE_MAX, TASK_REPORT_MAX, TASK_REPORT_MIN } from '../state';

export const VolunteerRegistrationSchema = z.object({
  skillKey: z.string().trim().min(1, 'marketplace:volunteers.validation.skill'),
  governorateIds: z.array(IdSchema).min(1, 'marketplace:volunteers.validation.regions').max(25),
  skills: z.array(z.string().trim().min(1).max(100)).max(12),
  helpTypes: z.array(VolunteerHelpTypeSchema).min(1, 'marketplace:volunteers.validation.helpTypes'),
  availability: z.array(z.boolean()).length(AVAILABILITY_CELLS),
  note: z.string().trim().max(500).nullable(),
});

export const TaskReportSchema = z.object({
  report: z
    .string()
    .trim()
    .min(TASK_REPORT_MIN, 'marketplace:volunteers.validation.report')
    .max(TASK_REPORT_MAX),
});

export const TaskRatingSchema = z.object({
  timeliness: z.number().int().min(RATING_MIN).max(RATING_MAX),
  completion: z.number().int().min(RATING_MIN).max(RATING_MAX),
  note: z.string().trim().max(RATING_NOTE_MAX).nullable(),
});

export type VolunteerRegistrationValues = z.infer<typeof VolunteerRegistrationSchema>;
export type TaskReportValues = z.infer<typeof TaskReportSchema>;
export type TaskRatingValues = z.infer<typeof TaskRatingSchema>;
