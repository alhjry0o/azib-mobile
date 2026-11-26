import type { CrudRepository, BaseEntity } from '../types';

// P12.1 extends additively. Legacy statuses stay valid; 'claimed' is a
// read-only alias mapped to 'handed_over'. NO price/amountPaid/currency here:
// Souk Khair is in-kind only. estimatedValue is stats-only and unverified.
export type SoukStatus =
  | 'available'
  | 'reserved'
  | 'claimed'
  | 'draft'
  | 'pending_review'
  | 'handed_over'
  | 'withdrawn'
  | 'expired'
  | 'rejected';

export type SoukCondition = 'new' | 'good' | 'acceptable';
export type SoukDeliveryMethod = 'self_pickup' | 'donor_delivers' | 'volunteer_help';

export interface SoukItem extends BaseEntity {
  readonly titleKey: string;
  readonly category: string;
  readonly status: SoukStatus;
  readonly donorId?: string | null;
  /** User-authored title; wins over titleKey when present. */
  readonly title?: string | null;
  readonly description?: string | null;
  readonly condition?: SoukCondition;
  /** General area only. Never an exact address (HRD P12 §3). */
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly deliveryMethod?: SoukDeliveryMethod;
  readonly imageFileIds?: readonly string[];
  /** Metadata fingerprints (P08 pipeline). Renaming evades them — see #51. */
  readonly imageFingerprints?: readonly string[];
  /** Stats only, labelled unverified. Never rendered as a public number. */
  readonly estimatedValue?: number | null;
  readonly noResaleConsentAt?: string | null;
  readonly reservedForRequestId?: string | null;
  readonly expiresAt?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly duplicateFlag?: boolean;
  readonly saleWordFlag?: boolean;
}

export interface CreateSoukItemInput {
  readonly titleKey: string;
  readonly category: string;
  readonly donorId?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly condition?: SoukCondition;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly deliveryMethod?: SoukDeliveryMethod;
  readonly imageFileIds?: readonly string[];
  readonly imageFingerprints?: readonly string[];
  readonly estimatedValue?: number | null;
  readonly noResaleConsentAt?: string | null;
  readonly expiresAt?: string | null;
  /** Optional initial status. Defaults to 'available' so seeded items stay browsable. */
  readonly status?: SoukStatus;
}
export interface UpdateSoukItemInput {
  readonly titleKey?: string;
  readonly category?: string;
  readonly status?: SoukStatus;
  readonly donorId?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly condition?: SoukCondition;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly deliveryMethod?: SoukDeliveryMethod;
  readonly imageFileIds?: readonly string[];
  readonly imageFingerprints?: readonly string[];
  readonly estimatedValue?: number | null;
  readonly noResaleConsentAt?: string | null;
  readonly reservedForRequestId?: string | null;
  readonly expiresAt?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly duplicateFlag?: boolean;
  readonly saleWordFlag?: boolean;
}

export type SoukRepository = CrudRepository<SoukItem, CreateSoukItemInput, UpdateSoukItemInput>;
