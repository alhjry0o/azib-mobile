// Saves are per-user (private to the saver). Views are AGGREGATE ONLY:
// no viewer identity is ever stored (D-8).
import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export interface OfferSave extends BaseEntity {
  readonly userId: string;
  readonly offerId: string;
}

export interface PartnerEngagementRepository {
  save(userId: string, offerId: string): Promise<Result<OfferSave>>;
  unsave(userId: string, offerId: string): Promise<Result<void>>;
  listSaved(userId: string): Promise<Result<readonly OfferSave[]>>;
  /** Increments an aggregate counter. Takes no viewer id by design. */
  recordView(offerId: string): Promise<Result<number>>;
  getViews(offerId: string): Promise<Result<number>>;
  getViewsForOffers(offerIds: readonly string[]): Promise<Result<Readonly<Record<string, number>>>>;
}
