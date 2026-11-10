import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type ProfileGender = 'male' | 'female' | 'unspecified';
export type MaritalStatus = 'single' | 'engaged' | 'married' | 'divorced' | 'widowed';

export interface Profile extends BaseEntity {
  readonly userId: string;
  readonly displayName: string;
  readonly gender: ProfileGender;
  readonly maritalStatus: MaritalStatus;
  readonly city: string | null;
  /** PII. Never expose publicly (AGENT_RULES §1 #20). */
  readonly phone: string | null;
}

export interface CreateProfileInput {
  readonly userId: string;
  readonly displayName: string;
  readonly gender: ProfileGender;
  readonly maritalStatus: MaritalStatus;
  readonly city?: string | null;
  readonly phone?: string | null;
}

export interface UpdateProfileInput {
  readonly displayName?: string;
  readonly gender?: ProfileGender;
  readonly maritalStatus?: MaritalStatus;
  readonly city?: string | null;
  readonly phone?: string | null;
}

export interface ProfileListQuery extends ListQuery {
  readonly city?: string;
  readonly maritalStatus?: MaritalStatus;
}

export interface ProfileRepository {
  getById(id: string): Promise<Result<Profile | null>>;
  getByUserId(userId: string): Promise<Result<Profile | null>>;
  create(input: CreateProfileInput): Promise<Result<Profile>>;
  update(id: string, input: UpdateProfileInput): Promise<Result<Profile>>;
  delete(id: string): Promise<Result<void>>;
  list(query?: ProfileListQuery): Promise<Result<PagedResult<Profile>>>;
}
