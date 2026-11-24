import type { CrudRepository, BaseEntity } from '../types';

// P11.1 extends additively. Legacy statuses stay valid so P03 crud tests pass.
// IMPORTANT: `status` is NOT the badge source. Only a PartnerVerification
// record with status 'verified' and a live validUntil grants the crown.
export type PartnerStatus =
  | 'draft'
  | 'verified'
  | 'suspended'
  | 'pending_verification'
  | 'rejected'
  | 'expired';

export interface Partner extends BaseEntity {
  readonly displayName: string;
  readonly category: string;
  readonly status: PartnerStatus;
  readonly ownerId?: string | null;
  readonly description?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly contactPhone?: string | null;
  readonly whatsapp?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly termsAcceptedAt?: string | null;
  /** Read-only pointer to the latest verification record. */
  readonly verificationId?: string | null;
  readonly verifiedAt?: string | null;
  readonly reverifyAfter?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly suspensionReasonKey?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export interface CreatePartnerInput {
  readonly displayName: string;
  readonly category: string;
  readonly ownerId?: string | null;
  readonly description?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly contactPhone?: string | null;
  readonly whatsapp?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly termsAcceptedAt?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export interface UpdatePartnerInput {
  readonly displayName?: string;
  readonly category?: string;
  readonly status?: PartnerStatus;
  readonly ownerId?: string | null;
  readonly description?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly city?: string | null;
  readonly contactPhone?: string | null;
  readonly whatsapp?: string | null;
  readonly imageFileIds?: readonly string[];
  readonly termsAcceptedAt?: string | null;
  readonly verificationId?: string | null;
  readonly verifiedAt?: string | null;
  readonly reverifyAfter?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly suspensionReasonKey?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export type PartnerRepository = CrudRepository<Partner, CreatePartnerInput, UpdatePartnerInput>;
