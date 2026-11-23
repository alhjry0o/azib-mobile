import type { CrudRepository, BaseEntity } from '../types';

// P10.1 extends additively. Legacy statuses stay valid; the group machine
// adds planning/agreed/cancelled. 'closed' is a read-only alias of planning.
export type WeddingStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'completed'
  | 'planning'
  | 'agreed'
  | 'cancelled';

export interface Wedding extends BaseEntity {
  readonly titleKey: string;
  readonly scheduledDate: string;
  readonly capacity: number;
  readonly status: WeddingStatus;
  readonly organizerId?: string | null;
  readonly coOrganizerIds?: readonly string[];
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly alternateDate?: string | null;
  readonly targetCount?: number | null;
  readonly descriptionKey?: string | null;
  readonly withdrawalPolicyVersion?: string | null;
  readonly maxGroupSize?: number | null;
  readonly budgetVersion?: number | null;
  readonly agreementId?: string | null;
  readonly cancellationReasonKey?: string | null;
}

export interface CreateWeddingInput {
  readonly titleKey: string;
  readonly scheduledDate: string;
  readonly capacity: number;
  readonly organizerId?: string | null;
  readonly coOrganizerIds?: readonly string[];
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly alternateDate?: string | null;
  readonly targetCount?: number | null;
  readonly descriptionKey?: string | null;
  readonly withdrawalPolicyVersion?: string | null;
  readonly maxGroupSize?: number | null;
}

export interface UpdateWeddingInput {
  readonly titleKey?: string;
  readonly scheduledDate?: string;
  readonly capacity?: number;
  readonly status?: WeddingStatus;
  readonly organizerId?: string | null;
  readonly coOrganizerIds?: readonly string[];
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly alternateDate?: string | null;
  readonly targetCount?: number | null;
  readonly descriptionKey?: string | null;
  readonly withdrawalPolicyVersion?: string | null;
  readonly maxGroupSize?: number | null;
  readonly budgetVersion?: number | null;
  readonly agreementId?: string | null;
  readonly cancellationReasonKey?: string | null;
}

export type WeddingRepository = CrudRepository<Wedding, CreateWeddingInput, UpdateWeddingInput>;
