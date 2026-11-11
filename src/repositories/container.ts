import type { AppEnv } from '@/config/env';

import type {
  ApplicationRepository,
  AuditRepository,
  ContentRepository,
  DisbursementRepository,
  DonationRepository,
  JobRepository,
  NotificationRepository,
  OfferRepository,
  PartnerRepository,
  ProfileRepository,
  ProgramRepository,
  SearchRepository,
  SettingsRepository,
  SoukRepository,
  VolunteerRepository,
  WeddingRepository,
} from './contracts';
import {
  createMockApplicationRepository,
  createMockJobRepository,
  createMockOfferRepository,
  createMockPartnerRepository,
  createMockProfileRepository,
  createMockProgramRepository,
  createMockSoukRepository,
  createMockVolunteerRepository,
  createMockWeddingRepository,
  createStubAuditRepository,
  createStubContentRepository,
  createStubDisbursementRepository,
  createStubDonationRepository,
  createStubNotificationRepository,
  createStubSearchRepository,
  createStubSettingsRepository,
  type MockRepositoryOptions,
} from './mock';

export type RepositoryMode = 'demo' | 'backend';

export interface RepositoryContainer {
  readonly mode: RepositoryMode;
  readonly profiles: ProfileRepository;
  readonly applications: ApplicationRepository;
  readonly programs: ProgramRepository;
  readonly donations: DonationRepository;
  readonly disbursements: DisbursementRepository;
  readonly weddings: WeddingRepository;
  readonly partners: PartnerRepository;
  readonly offers: OfferRepository;
  readonly souk: SoukRepository;
  readonly jobs: JobRepository;
  readonly volunteers: VolunteerRepository;
  readonly content: ContentRepository;
  readonly notifications: NotificationRepository;
  readonly search: SearchRepository;
  readonly audit: AuditRepository;
  readonly settings: SettingsRepository;
}

export interface CreateRepositoryContainerOptions {
  readonly mode: RepositoryMode;
  readonly env: AppEnv;
  readonly mockOptions?: MockRepositoryOptions;
}

export function createRepositoryContainer(
  options: CreateRepositoryContainerOptions,
): RepositoryContainer {
  if (options.mode === 'demo') {
    return Object.freeze(buildDemoRepositories(options.mockOptions));
  }
  return Object.freeze(buildBackendRepositories());
}

function buildDemoRepositories(mockOptions?: MockRepositoryOptions): RepositoryContainer {
  return {
    mode: 'demo',
    profiles: createMockProfileRepository(mockOptions),
    applications: createMockApplicationRepository(mockOptions),
    programs: createMockProgramRepository(mockOptions),
    donations: createStubDonationRepository(),
    disbursements: createStubDisbursementRepository(),
    weddings: createMockWeddingRepository(mockOptions),
    partners: createMockPartnerRepository(mockOptions),
    offers: createMockOfferRepository(mockOptions),
    souk: createMockSoukRepository(mockOptions),
    jobs: createMockJobRepository(mockOptions),
    volunteers: createMockVolunteerRepository(mockOptions),
    content: createStubContentRepository(),
    notifications: createStubNotificationRepository(),
    search: createStubSearchRepository(),
    audit: createStubAuditRepository(),
    settings: createStubSettingsRepository(),
  };
}

function buildBackendRepositories(): RepositoryContainer {
  return {
    mode: 'backend',
    profiles: createMockProfileRepository(),
    applications: createMockApplicationRepository(),
    programs: createMockProgramRepository(),
    donations: createStubDonationRepository(),
    disbursements: createStubDisbursementRepository(),
    weddings: createMockWeddingRepository(),
    partners: createMockPartnerRepository(),
    offers: createMockOfferRepository(),
    souk: createMockSoukRepository(),
    jobs: createMockJobRepository(),
    volunteers: createMockVolunteerRepository(),
    content: createStubContentRepository(),
    notifications: createStubNotificationRepository(),
    search: createStubSearchRepository(),
    audit: createStubAuditRepository(),
    settings: createStubSettingsRepository(),
  };
}
