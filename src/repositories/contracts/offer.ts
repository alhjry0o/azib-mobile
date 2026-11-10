import type { CrudRepository, BaseEntity } from '../types';

export interface Offer extends BaseEntity {
  readonly partnerId: string;
  readonly titleKey: string;
  readonly discountPercent: number;
  readonly status: 'draft' | 'active' | 'expired';
}

export interface CreateOfferInput {
  readonly partnerId: string;
  readonly titleKey: string;
  readonly discountPercent: number;
}

export interface UpdateOfferInput {
  readonly titleKey?: string;
  readonly discountPercent?: number;
  readonly status?: Offer['status'];
}

export type OfferRepository = CrudRepository<Offer, CreateOfferInput, UpdateOfferInput>;
