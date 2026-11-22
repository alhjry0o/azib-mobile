import { z } from 'zod';
import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const DisbursementStatusSchema = z.enum([
  'pending',
  'confirmed',
  'proposed',
  'approved',
  'paid_recorded',
  'confirmed_by_beneficiary',
  'disputed',
  'rejected',
]);

export const DisbursementSchema = z.object({
  id: IdSchema,
  applicationId: IdSchema,
  amount: z.number().int().positive(),
  currency: CurrencySchema,
  status: DisbursementStatusSchema,
  providerReference: z.string().max(200).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  makerId: IdSchema.nullable().optional(),
  checkerId: IdSchema.nullable().optional(),
  approvedAt: IsoDateSchema.nullable().optional(),
  paidAt: IsoDateSchema.nullable().optional(),
  beneficiaryConfirmedAt: IsoDateSchema.nullable().optional(),
  rejectionReasonKey: z.string().max(160).nullable().optional(),
  disputeNote: z.string().max(1000).nullable().optional(),
});

export const CreateDisbursementInputSchema = z.object({
  applicationId: IdSchema,
  amount: z.number().int().positive(),
  makerId: IdSchema.nullable().optional(),
});
