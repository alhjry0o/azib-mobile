import type { CrudRepository, BaseEntity } from '../types';

export interface Volunteer extends BaseEntity {
  readonly userId: string;
  readonly skillKey: string;
  readonly status: 'active' | 'inactive';
}

export interface CreateVolunteerInput {
  readonly userId: string;
  readonly skillKey: string;
}

export interface UpdateVolunteerInput {
  readonly skillKey?: string;
  readonly status?: Volunteer['status'];
}

export type VolunteerRepository = CrudRepository<
  Volunteer,
  CreateVolunteerInput,
  UpdateVolunteerInput
>;
