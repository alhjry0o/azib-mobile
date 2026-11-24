import type { CrudRepository, BaseEntity } from '../types';

// P11.1 extends additively. `discountPercent` stays for P03/P07 consumers.
// Expiry is derived from validUntil; the client never writes 'expired'.
export type OfferStatus =
  | 'draft'
  | 'active'
  | 'expired'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type DiscountType = 'percent' | 'fixed' | 'gift' | 'service';
/** Who may benefit. Provisional policy: only 'beneficiaries' is enabled. */
export type OfferAudience = 'everyone' | 'beneficiaries' | 'engaged';

export interface Offer extends BaseEntity {
  readonly partnerId: string;
  readonly titleKey: string;
  readonly discountPercent: number;
  readonly status: OfferStatus;
  /** User-authored title; wins over titleKey when present. */
  readonly title?: string | null;
  readonly discountType?: DiscountType;
  readonly discountValue?: number | null;
  /** Demo offers must label their value as a placeholder, never a real price. */
  readonly discountPlaceholder?: boolean;
  readonly audience?: OfferAudience;
  readonly products?: readonly string[];
  readonly terms?: string | null;
  readonly validFrom?: string | null;
  readonly validUntil?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly category?: string | null;
  readonly governorateId?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly publishedAt?: string | null;
  readonly reviewRequestedAt?: string | null;
}

export interface CreateOfferInput {
  readonly partnerId: string;
  readonly titleKey: string;
  readonly discountPercent: number;
  readonly title?: string | null;
  readonly discountType?: DiscountType;
  readonly discountValue?: number | null;
  readonly discountPlaceholder?: boolean;
  readonly audience?: OfferAudience;
  readonly products?: readonly string[];
  readonly terms?: string | null;
  readonly validFrom?: string | null;
  readonly validUntil?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly category?: string | null;
  readonly governorateId?: string | null;
}

export interface UpdateOfferInput {
  readonly titleKey?: string;
  readonly discountPercent?: number;
  readonly status?: OfferStatus;
  readonly title?: string | null;
  readonly discountType?: DiscountType;
  readonly discountValue?: number | null;
  readonly discountPlaceholder?: boolean;
  readonly audience?: OfferAudience;
  readonly products?: readonly string[];
  readonly terms?: string | null;
  readonly validFrom?: string | null;
  readonly validUntil?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly category?: string | null;
  readonly governorateId?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly publishedAt?: string | null;
  readonly reviewRequestedAt?: string | null;
}

export type OfferRepository = CrudRepository<Offer, CreateOfferInput, UpdateOfferInput>;
