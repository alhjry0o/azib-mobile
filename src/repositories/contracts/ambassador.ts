// Ambassadors nominate partners and upload activity photos for their regions.
// They never reach verification documents or beneficiary data (D-9).
import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type AmbassadorApplicationStatus = 'pending' | 'approved' | 'rejected';
export type AmbassadorTaskKind = 'nominate_partner' | 'activity_photos';
export type AmbassadorTaskStatus = 'assigned' | 'submitted' | 'accepted' | 'rejected';

export interface AmbassadorApplication extends BaseEntity {
  readonly userId: string;
  readonly governorateIds: readonly string[];
  readonly motivation: string;
  readonly status: AmbassadorApplicationStatus;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
}

export interface AmbassadorTask extends BaseEntity {
  readonly ambassadorId: string;
  readonly kind: AmbassadorTaskKind;
  readonly governorateId: string;
  readonly titleKey: string;
  readonly status: AmbassadorTaskStatus;
  readonly nominatedPartnerId?: string | null;
  readonly photoFileIds: readonly string[];
  readonly submittedAt?: string | null;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
}

export interface ApplyAmbassadorInput {
  readonly userId: string;
  readonly governorateIds: readonly string[];
  readonly motivation: string;
}

export interface CreateAmbassadorTaskInput {
  readonly ambassadorId: string;
  readonly kind: AmbassadorTaskKind;
  readonly governorateId: string;
  readonly titleKey: string;
}

export interface UpdateAmbassadorTaskInput {
  readonly status?: AmbassadorTaskStatus;
  readonly nominatedPartnerId?: string | null;
  readonly photoFileIds?: readonly string[];
  readonly submittedAt?: string | null;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
}

export interface AmbassadorRepository {
  getApplicationByUser(userId: string): Promise<Result<AmbassadorApplication | null>>;
  listApplications(query?: ListQuery): Promise<Result<PagedResult<AmbassadorApplication>>>;
  apply(input: ApplyAmbassadorInput): Promise<Result<AmbassadorApplication>>;
  decideApplication(
    id: string,
    decision: 'approved' | 'rejected',
    decidedBy: string,
    reasonKey?: string | null,
  ): Promise<Result<AmbassadorApplication>>;
  createTask(input: CreateAmbassadorTaskInput): Promise<Result<AmbassadorTask>>;
  listTasks(ambassadorId: string): Promise<Result<readonly AmbassadorTask[]>>;
  listTasksByRegion(governorateId: string): Promise<Result<readonly AmbassadorTask[]>>;
  updateTask(id: string, input: UpdateAmbassadorTaskInput): Promise<Result<AmbassadorTask>>;
}
