// Not-yet-implemented repository stubs (13). Filled in Part 4b.
// Honest behavior: every method returns AppError.notConnected().

import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

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
  ProgramRepository,
  SearchRepository,
  SettingsRepository,
  SoukRepository,
  VolunteerRepository,
  WeddingRepository,
} from '../contracts';

function nc<T>(method: string): () => Promise<Result<T>> {
  return async () => ({
    ok: false as const,
    error: AppError.notConnected({
      code: 'REPO_NOT_IMPLEMENTED',
      context: { method },
    }),
  });
}

export function createStubDonationRepository(): DonationRepository {
  return Object.freeze({
    getById: nc('donations.getById'),
    list: nc('donations.list'),
    listByDonor: nc('donations.listByDonor'),
    create: nc('donations.create'),
  }) as unknown as DonationRepository;
}

export function createStubDisbursementRepository(): DisbursementRepository {
  return Object.freeze({
    getById: nc('disbursements.getById'),
    list: nc('disbursements.list'),
    listByApplication: nc('disbursements.listByApplication'),
    create: nc('disbursements.create'),
  }) as unknown as DisbursementRepository;
}

export function createStubWeddingRepository(): WeddingRepository {
  return Object.freeze({
    getById: nc('weddings.getById'),
    list: nc('weddings.list'),
    create: nc('weddings.create'),
    update: nc('weddings.update'),
    delete: nc('weddings.delete'),
  }) as unknown as WeddingRepository;
}

export function createStubPartnerRepository(): PartnerRepository {
  return Object.freeze({
    getById: nc('partners.getById'),
    list: nc('partners.list'),
    create: nc('partners.create'),
    update: nc('partners.update'),
    delete: nc('partners.delete'),
  }) as unknown as PartnerRepository;
}

export function createStubOfferRepository(): OfferRepository {
  return Object.freeze({
    getById: nc('offers.getById'),
    list: nc('offers.list'),
    create: nc('offers.create'),
    update: nc('offers.update'),
    delete: nc('offers.delete'),
  }) as unknown as OfferRepository;
}

export function createStubSoukRepository(): SoukRepository {
  return Object.freeze({
    getById: nc('souk.getById'),
    list: nc('souk.list'),
    create: nc('souk.create'),
    update: nc('souk.update'),
    delete: nc('souk.delete'),
  }) as unknown as SoukRepository;
}

export function createStubJobRepository(): JobRepository {
  return Object.freeze({
    getById: nc('jobs.getById'),
    list: nc('jobs.list'),
    create: nc('jobs.create'),
    update: nc('jobs.update'),
    delete: nc('jobs.delete'),
  }) as unknown as JobRepository;
}

export function createStubVolunteerRepository(): VolunteerRepository {
  return Object.freeze({
    getById: nc('volunteers.getById'),
    list: nc('volunteers.list'),
    create: nc('volunteers.create'),
    update: nc('volunteers.update'),
    delete: nc('volunteers.delete'),
  }) as unknown as VolunteerRepository;
}

export function createStubContentRepository(): ContentRepository {
  return Object.freeze({
    getById: nc('content.getById'),
    getBySlug: nc('content.getBySlug'),
    list: nc('content.list'),
  }) as unknown as ContentRepository;
}

export function createStubNotificationRepository(): NotificationRepository {
  return Object.freeze({
    getById: nc('notifications.getById'),
    list: nc('notifications.list'),
    markRead: nc('notifications.markRead'),
    delete: nc('notifications.delete'),
  }) as unknown as NotificationRepository;
}

export function createStubSearchRepository(): SearchRepository {
  return Object.freeze({
    search: nc('search.search'),
  }) as unknown as SearchRepository;
}

export function createStubAuditRepository(): AuditRepository {
  return Object.freeze({
    getById: nc('audit.getById'),
    list: nc('audit.list'),
    append: nc('audit.append'),
  }) as unknown as AuditRepository;
}

export function createStubSettingsRepository(): SettingsRepository {
  return Object.freeze({
    get: nc('settings.get'),
    update: nc('settings.update'),
  }) as unknown as SettingsRepository;
}

// Keep the unused import references for TypeScript to verify the stub shapes.
export type __StubsTypeCheck = {
  ApplicationRepository: ApplicationRepository;
  ProgramRepository: ProgramRepository;
};
