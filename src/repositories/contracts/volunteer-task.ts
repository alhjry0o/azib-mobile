import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type VolunteerTaskKind = 'donation_delivery' | 'wedding_coordination' | 'partner_visits';
export type VolunteerTaskStatus =
  | 'assigned'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'reviewed'
  | 'cancelled';

export interface VolunteerTask extends BaseEntity {
  readonly volunteerId: string;
  readonly kind: VolunteerTaskKind;
  readonly governorateId: string;
  readonly titleKey: string;
  readonly status: VolunteerTaskStatus;
  readonly acceptedAt?: string | null;
  readonly declinedAt?: string | null;
  readonly completedAt?: string | null;
  readonly reviewedAt?: string | null;
  readonly cancelledAt?: string | null;
  /** Completion report written by the volunteer. Required to complete. */
  readonly report?: string | null;
  /** Staff-private, two axes. Never shown to the volunteer (ADR-0066). */
  readonly timelinessScore?: number | null;
  readonly completionScore?: number | null;
  readonly ratingNote?: string | null;
  readonly ratedBy?: string | null;
  readonly reasonKey?: string | null;
}

export interface CreateVolunteerTaskInput {
  readonly volunteerId: string;
  readonly kind: VolunteerTaskKind;
  readonly governorateId: string;
  readonly titleKey: string;
}

export interface UpdateVolunteerTaskInput {
  readonly status?: VolunteerTaskStatus;
  readonly acceptedAt?: string | null;
  readonly declinedAt?: string | null;
  readonly completedAt?: string | null;
  readonly reviewedAt?: string | null;
  readonly cancelledAt?: string | null;
  readonly report?: string | null;
  readonly timelinessScore?: number | null;
  readonly completionScore?: number | null;
  readonly ratingNote?: string | null;
  readonly ratedBy?: string | null;
  readonly reasonKey?: string | null;
}

export interface VolunteerTaskRepository {
  getById(id: string): Promise<Result<VolunteerTask | null>>;
  listByVolunteer(volunteerId: string): Promise<Result<readonly VolunteerTask[]>>;
  listByRegion(governorateId: string): Promise<Result<readonly VolunteerTask[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<VolunteerTask>>>;
  create(input: CreateVolunteerTaskInput): Promise<Result<VolunteerTask>>;
  update(id: string, input: UpdateVolunteerTaskInput): Promise<Result<VolunteerTask>>;
}
