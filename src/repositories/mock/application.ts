import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import {
  CreateApplicationInputSchema,
  UpdateApplicationInputSchema,
} from '@/schemas/application';
import type {
  Application,
  ApplicationListQuery,
  ApplicationRepository,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '../contracts/application';
import { PUBLICATION_CONSENT_VERSION } from '../contracts/application';
import type { PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

const SUBMITTABLE: readonly ApplicationStatus[] = ['draft', 'info_requested'];

export function createMockApplicationRepository(
  options: MockRepositoryOptions = {},
): ApplicationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Application>();
  let referenceCounter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  /** Demo-labeled reference number. The real one is minted server-side in P18. */
  function mintReference(): string {
    referenceCounter += 1;
    const year = new Date().getUTCFullYear();
    return `AZIB-DEMO-${year}-${String(referenceCounter).padStart(5, '0')}`;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Application | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async list(query?: ApplicationListQuery): Promise<Result<PagedResult<Application>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      let items: Application[] = Array.from(byId.values());
      if (query?.status) items = items.filter((a) => a.status === query.status);
      if (query?.programId) items = items.filter((a) => a.programId === query.programId);
      if (query?.applicantId) items = items.filter((a) => a.applicantId === query.applicantId);
      const total = items.length;
      items = items.slice(offset, offset + limit);
      return ok({ items, total, limit, offset });
    },

    async listByApplicant(applicantId: string): Promise<Result<readonly Application[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const items = Array.from(byId.values()).filter((a) => a.applicantId === applicantId);
      return ok(items);
    },

    async create(input: CreateApplicationInput): Promise<Result<Application>> {
      const parsed = CreateApplicationInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const id = `mock-application-${Date.now()}-${byId.size}`;
      const now = new Date().toISOString();
      const app: Application = Object.freeze({
        id,
        applicantId: parsed.data.applicantId,
        programId: parsed.data.programId,
        status: 'draft' as const,
        requestedAmount: parsed.data.requestedAmount,
        currency: 'YER' as const,
        notes: parsed.data.notes ?? null,
        reviewerNote: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
        referenceNumber: null,
        submittedAt: null,
        payload: parsed.data.payload ?? null,
        evaluation: null,
        infoRequest: null,
        decision: null,
        appeal: null,
        publicationConsent: null,
      });
      byId.set(id, app);
      return ok(app);
    },

    async updateStatus(
      id: string,
      status: ApplicationStatus,
      reviewerNote?: string,
    ): Promise<Result<Application>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      const updated: Application = Object.freeze({
        ...existing,
        status,
        ...(reviewerNote !== undefined && { reviewerNote }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },

    async update(id: string, input: UpdateApplicationInput): Promise<Result<Application>> {
      const parsed = UpdateApplicationInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      const patch = parsed.data;
      const updated: Application = Object.freeze({
        ...existing,
        ...(patch.requestedAmount !== undefined && { requestedAmount: patch.requestedAmount }),
        ...(patch.notes !== undefined && { notes: patch.notes }),
        ...(patch.payload !== undefined && { payload: patch.payload }),
        ...(patch.evaluation !== undefined && { evaluation: patch.evaluation }),
        ...(patch.infoRequest !== undefined && { infoRequest: patch.infoRequest }),
        ...(patch.decision !== undefined && { decision: patch.decision }),
        ...(patch.appeal !== undefined && { appeal: patch.appeal }),
        ...(patch.publicationConsent !== undefined && {
          publicationConsent: patch.publicationConsent,
        }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },

    async submit(id: string): Promise<Result<Application>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      if (!SUBMITTABLE.includes(existing.status)) {
        return {
          ok: false,
          error: AppError.conflict({
            code: 'INVALID_TRANSITION',
            context: { from: existing.status, to: 'submitted' },
          }),
        };
      }
      const now = new Date().toISOString();
      const wantsPublication = existing.payload?.declarations.publicationConsent === true;
      const updated: Application = Object.freeze({
        ...existing,
        status: 'submitted' as const,
        referenceNumber: existing.referenceNumber ?? mintReference(),
        submittedAt: now,
        infoRequest: null,
        publicationConsent: wantsPublication
          ? Object.freeze({
              grantedAt: now,
              revokedAt: null,
              version: PUBLICATION_CONSENT_VERSION,
            })
          : null,
        updatedAt: now,
      });
      byId.set(id, updated);
      return ok(updated);
    },

    async delete(id: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      byId.delete(id);
      return ok(undefined);
    },
  });
}
