import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateVolunteerTaskInput,
  UpdateVolunteerTaskInput,
  VolunteerTask,
  VolunteerTaskRepository,
} from '../contracts/volunteer-task';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockVolunteerTaskRepository(
  options: MockRepositoryOptions = {},
): VolunteerTaskRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, VolunteerTask>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<VolunteerTask | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async listByVolunteer(volunteerId: string): Promise<Result<readonly VolunteerTask[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((t) => t.volunteerId === volunteerId));
    },

    async listByRegion(governorateId: string): Promise<Result<readonly VolunteerTask[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((t) => t.governorateId === governorateId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<VolunteerTask>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async create(input: CreateVolunteerTaskInput): Promise<Result<VolunteerTask>> {
      if (!input.volunteerId || !input.governorateId || !input.titleKey) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_TASK' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const record: VolunteerTask = Object.freeze({
        id: `mock-volunteer-task-${Date.now()}-${counter}`,
        volunteerId: input.volunteerId,
        kind: input.kind,
        governorateId: input.governorateId,
        titleKey: input.titleKey,
        status: 'assigned' as const,
        acceptedAt: null,
        declinedAt: null,
        completedAt: null,
        reviewedAt: null,
        cancelledAt: null,
        report: null,
        timelinessScore: null,
        completionScore: null,
        ratingNote: null,
        ratedBy: null,
        reasonKey: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(record.id, record);
      return ok(record);
    },

    async update(id: string, input: UpdateVolunteerTaskInput): Promise<Result<VolunteerTask>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'TASK_NOT_FOUND' }) };
      }
      const updated: VolunteerTask = Object.freeze({
        ...existing,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.acceptedAt !== undefined && { acceptedAt: input.acceptedAt }),
        ...(input.declinedAt !== undefined && { declinedAt: input.declinedAt }),
        ...(input.completedAt !== undefined && { completedAt: input.completedAt }),
        ...(input.reviewedAt !== undefined && { reviewedAt: input.reviewedAt }),
        ...(input.cancelledAt !== undefined && { cancelledAt: input.cancelledAt }),
        ...(input.report !== undefined && { report: input.report }),
        ...(input.timelinessScore !== undefined && { timelinessScore: input.timelinessScore }),
        ...(input.completionScore !== undefined && { completionScore: input.completionScore }),
        ...(input.ratingNote !== undefined && { ratingNote: input.ratingNote }),
        ...(input.ratedBy !== undefined && { ratedBy: input.ratedBy }),
        ...(input.reasonKey !== undefined && { reasonKey: input.reasonKey }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },
  });
}
