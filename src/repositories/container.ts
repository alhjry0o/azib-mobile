import type { AppEnv } from '@/config/env';
import type { SearchProvider } from '@/providers/contracts';
import type {
  AmbassadorRepository,
  ApplicationRepository,
  AuditRepository,
  ContentRepository,
  DisbursementRepository,
  DonationRepository,
  JobApplicationRepository,
  JobEngagementRepository,
  JobRepository,
  NotificationRepository,
  OfferReportRepository,
  OfferRepository,
  PartnerEngagementRepository,
  PartnerRepository,
  PartnerVerificationRepository,
  ProfileRepository,
  ProgramRepository,
  SearchRepository,
  SettingsRepository,
  SoukChatRepository,
  SoukReportRepository,
  SoukRepository,
  SoukRequestRepository,
  VolunteerRepository,
  VolunteerTaskRepository,
  WeddingBudgetRepository,
  WeddingChatRepository,
  WeddingGroupRepository,
  WeddingPollRepository,
  WeddingRepository,
} from './contracts';
import {
  createMockAmbassadorRepository,
  createMockApplicationRepository,
  createMockAuditRepository,
  createMockContentRepository,
  createMockDisbursementRepository,
  createMockDonationRepository,
  createMockJobApplicationRepository,
  createMockJobEngagementRepository,
  createMockJobRepository,
  createMockNotificationRepository,
  createMockOfferReportRepository,
  createMockOfferRepository,
  createMockPartnerEngagementRepository,
  createMockPartnerRepository,
  createMockPartnerVerificationRepository,
  createMockProfileRepository,
  createMockProgramRepository,
  createMockSearchRepository,
  createMockSettingsRepository,
  createMockSoukChatRepository,
  createMockSoukReportRepository,
  createMockSoukRepository,
  createMockSoukRequestRepository,
  createMockVolunteerRepository,
  createMockVolunteerTaskRepository,
  createMockWeddingBudgetRepository,
  createMockWeddingChatRepository,
  createMockWeddingGroupRepository,
  createMockWeddingPollRepository,
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
  readonly weddingGroups: WeddingGroupRepository;
  readonly weddingPolls: WeddingPollRepository;
  readonly weddingBudgets: WeddingBudgetRepository;
  readonly weddingChat: WeddingChatRepository;
  readonly partners: PartnerRepository;
  readonly partnerVerifications: PartnerVerificationRepository;
  readonly offerReports: OfferReportRepository;
  readonly partnerEngagement: PartnerEngagementRepository;
  readonly ambassadors: AmbassadorRepository;
  readonly offers: OfferRepository;
  readonly souk: SoukRepository;
  readonly soukRequests: SoukRequestRepository;
  readonly soukReports: SoukReportRepository;
  readonly soukChat: SoukChatRepository;
  readonly jobs: JobRepository;
  readonly jobApplications: JobApplicationRepository;
  readonly jobEngagement: JobEngagementRepository;
  readonly volunteers: VolunteerRepository;
  readonly volunteerTasks: VolunteerTaskRepository;
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
    weddingGroups: createMockWeddingGroupRepository(mockOptions),
    weddingPolls: createMockWeddingPollRepository(mockOptions),
    weddingBudgets: createMockWeddingBudgetRepository(mockOptions),
    weddingChat: createMockWeddingChatRepository(mockOptions),
    partners: createMockPartnerRepository(mockOptions),
    partnerVerifications: createMockPartnerVerificationRepository(mockOptions),
    offerReports: createMockOfferReportRepository(mockOptions),
    partnerEngagement: createMockPartnerEngagementRepository(mockOptions),
    ambassadors: createMockAmbassadorRepository(mockOptions),
    offers: createMockOfferRepository(mockOptions),
    souk: createMockSoukRepository(mockOptions),
    soukRequests: createMockSoukRequestRepository(mockOptions),
    soukReports: createMockSoukReportRepository(mockOptions),
    soukChat: createMockSoukChatRepository(mockOptions),
    jobs: createMockJobRepository(mockOptions),
    jobApplications: createMockJobApplicationRepository(mockOptions),
    jobEngagement: createMockJobEngagementRepository(mockOptions),
    volunteers: createMockVolunteerRepository(mockOptions),
    volunteerTasks: createMockVolunteerTaskRepository(mockOptions),
    content: createMockContentRepository(mockOptions),
    notifications: createMockNotificationRepository(mockOptions),
    search: createMockSearchRepository(searchProvider),
    audit: createMockAuditRepository(mockOptions),
    settings: createMockSettingsRepository(mockOptions),
  };
}
