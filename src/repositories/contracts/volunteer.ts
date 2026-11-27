import type { CrudRepository, BaseEntity } from '../types';

// P13.1 extends additively. Default status stays 'active'; 'inactive' stays valid.
export type VolunteerStatus = 'active' | 'inactive';
export type VolunteerHelpType = 'donation_delivery' | 'wedding_coordination' | 'partner_visits';

export interface Volunteer extends BaseEntity {
  readonly userId: string;
  readonly skillKey: string;
  readonly status: VolunteerStatus;
  readonly governorateIds?: readonly string[];
  readonly skills?: readonly string[];
  readonly helpTypes?: readonly VolunteerHelpType[];
  /** 7 days × 3 slots = 21 boolean cells. No Date, no timezone. */
  readonly availability?: readonly boolean[];
  readonly note?: string | null;
}

export interface CreateVolunteerInput {
  readonly userId: string;
  readonly skillKey: string;
  readonly governorateIds?: readonly string[];
  readonly skills?: readonly string[];
  readonly helpTypes?: readonly VolunteerHelpType[];
  readonly availability?: readonly boolean[];
  readonly note?: string | null;
}

export interface UpdateVolunteerInput {
  readonly skillKey?: string;
  readonly status?: VolunteerStatus;
  readonly governorateIds?: readonly string[];
  readonly skills?: readonly string[];
  readonly helpTypes?: readonly VolunteerHelpType[];
  readonly availability?: readonly boolean[];
  readonly note?: string | null;
}

export type VolunteerRepository = CrudRepository<
  Volunteer,
  CreateVolunteerInput,
  UpdateVolunteerInput
>;
