import type { AppEnv } from '@/config/env';
import type { SearchProvider } from '@/providers/contracts';

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
  createMockAuditRepository,
  createMockContentRepository,
  createMockDisbursementRepository,
  createMockDonationRepository,
  createMockJobRepository,
  createMockNotificationRepository,
  createMockOfferRepository,
  createMockPartnerRepository,
  createMockProfileRepository,
  createMockProgramRepository,
  createMockSearchRepository,
  createMockSettingsRepository,
  createMockSoukRepository,
  createMockVolunteerRepository,
  createMockWeddingRepository,
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
  /** SearchProvider used by SearchRepository (delegation, no duplication). */
  readonly searchProvider: SearchProvider;
}

export function createRepositoryContainer(
  options: CreateRepositoryContainerOptions,
): RepositoryContainer {
  if (options.mode === 'demo') {
    return Object.freeze(buildRepositories('demo', options.mockOptions, options.searchProvider));
  }
  return Object.freeze(buildRepositories('backend', undefined, options.searchProvider));
}

function buildRepositories(
  mode: RepositoryMode,
  mockOptions: MockRepositoryOptions | undefined,
  searchProvider: SearchProvider,
): RepositoryContainer {
  return {
    mode,
    profiles: createMockProfileRepository(mockOptions),
    applications: createMockApplicationRepository(mockOptions),
    programs: createMockProgramRepository(mockOptions),
    donations: createMockDonationRepository(mockOptions),
    disbursements: createMockDisbursementRepository(mockOptions),
    weddings: createMockWeddingRepository(mockOptions),
    partners: createMockPartnerRepository(mockOptions),
    offers: createMockOfferRepository(mockOptions),
    souk: createMockSoukRepository(mockOptions),
    jobs: createMockJobRepository(mockOptions),
    volunteers: createMockVolunteerRepository(mockOptions),
    content: createMockContentRepository(mockOptions),
    notifications: createMockNotificationRepository(mockOptions),
    search: createMockSearchRepository(searchProvider),
    audit: createMockAuditRepository(mockOptions),
    settings: createMockSettingsRepository(mockOptions),
  };
}
