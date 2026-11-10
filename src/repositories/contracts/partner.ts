import type { CrudRepository, BaseEntity } from '../types';

export interface Partner extends BaseEntity {
  readonly displayName: string;
  readonly category: string;
  readonly status: 'draft' | 'verified' | 'suspended';
}

export interface CreatePartnerInput {
  readonly displayName: string;
  readonly category: string;
}

export interface UpdatePartnerInput {
  readonly displayName?: string;
  readonly category?: string;
  readonly status?: Partner['status'];
}

export type PartnerRepository = CrudRepository<Partner, CreatePartnerInput, UpdatePartnerInput>;
