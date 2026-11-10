import type { CrudRepository, BaseEntity } from '../types';

export interface SoukItem extends BaseEntity {
  readonly titleKey: string;
  readonly category: string;
  readonly status: 'available' | 'reserved' | 'claimed';
}

export interface CreateSoukItemInput {
  readonly titleKey: string;
  readonly category: string;
}

export interface UpdateSoukItemInput {
  readonly titleKey?: string;
  readonly category?: string;
  readonly status?: SoukItem['status'];
}

export type SoukRepository = CrudRepository<SoukItem, CreateSoukItemInput, UpdateSoukItemInput>;
