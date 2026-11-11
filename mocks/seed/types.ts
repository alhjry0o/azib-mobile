// Seed types. All demo data must carry dataOrigin='demo'.
// Files under mocks/ are excluded from the hardcoded-Arabic check.
// Arabic strings here are intentional: fabricated Arabic content for demo mode.

import type {
  AuditEntry,
  ContentRecord,
  CreateApplicationInput,
  CreateAuditEntryInput,
  CreateDisbursementInput,
  CreateDonationInput,
  CreateOfferInput,
  CreatePartnerInput,
  CreateProfileInput,
  CreateProgramInput,
  CreateSoukItemInput,
  CreateVolunteerInput,
  CreateWeddingInput,
  InAppNotification,
  Job,
  Settings,
} from '@/repositories/contracts';

export const SEED_REFERENCE_DATE = '2026-01-01T00:00:00.000Z';

/** Job uses CrudRepository without a dedicated CreateJobInput — reuse Job fields. */
export type SeedJob = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'dataOrigin'>;

export interface SeedContentRecord {
  slug: string;
  titleKey: string;
  bodyKey: string;
}

export interface SeedNotification {
  userId: string;
  titleKey: string;
  bodyKey: string;
  read: boolean;
}

export interface SeedAuditEntry extends CreateAuditEntryInput {
  /** ISO date; if absent, SEED_REFERENCE_DATE is used. */
  occurredAt?: string;
}

export interface SeedSettingsEntry {
  key: string;
  value: Readonly<Record<string, unknown>>;
}

export interface SeedBundle {
  profiles: readonly CreateProfileInput[];
  programs: readonly CreateProgramInput[];
  applications: readonly CreateApplicationInput[];
  weddings: readonly CreateWeddingInput[];
  partners: readonly CreatePartnerInput[];
  offers: readonly CreateOfferInput[];
  souk: readonly CreateSoukItemInput[];
  jobs: readonly SeedJob[];
  volunteers: readonly CreateVolunteerInput[];
  donations: readonly CreateDonationInput[];
  disbursements: readonly CreateDisbursementInput[];
  content: readonly SeedContentRecord[];
  notifications: readonly SeedNotification[];
  audit: readonly SeedAuditEntry[];
  settings: readonly SeedSettingsEntry[];
}

// Re-export the shapes used by the existing contracts, so consumers have one import.
export type {
  AuditEntry,
  ContentRecord,
  CreateApplicationInput,
  CreateDisbursementInput,
  CreateDonationInput,
  CreateOfferInput,
  CreatePartnerInput,
  CreateProfileInput,
  CreateProgramInput,
  CreateSoukItemInput,
  CreateVolunteerInput,
  CreateWeddingInput,
  InAppNotification,
  Settings,
};
