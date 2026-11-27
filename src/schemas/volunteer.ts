import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const VolunteerStatusSchema = z.enum(['active', 'inactive']);
export const VolunteerHelpTypeSchema = z.enum([
  'donation_delivery',
  'wedding_coordination',
  'partner_visits',
]);

/** 7 days × 3 slots. Pure grid, no Date and no timezone. */
export const AVAILABILITY_CELL_COUNT = 21;

const AvailabilitySchema = z.array(z.boolean()).length(AVAILABILITY_CELL_COUNT);

const sharedFields = {
  governorateIds: z.array(IdSchema).max(25).optional(),
  skills: z.array(z.string().min(1).max(100)).max(12).optional(),
  helpTypes: z.array(VolunteerHelpTypeSchema).max(3).optional(),
  availability: AvailabilitySchema.optional(),
  note: z.string().min(1).max(500).nullable().optional(),
};

export const VolunteerSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  skillKey: z.string().min(1),
  status: VolunteerStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  ...sharedFields,
});

export const CreateVolunteerInputSchema = z.object({
  userId: IdSchema,
  skillKey: z.string().min(1),
  ...sharedFields,
});

export const UpdateVolunteerInputSchema = z.object({
  skillKey: z.string().min(1).optional(),
  status: VolunteerStatusSchema.optional(),
  ...sharedFields,
});
