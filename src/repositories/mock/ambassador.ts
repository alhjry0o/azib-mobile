import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  AmbassadorApplication,
  AmbassadorRepository,
  AmbassadorTask,
  ApplyAmbassadorInput,
  CreateAmbassadorTaskInput,
  UpdateAmbassadorTaskInput,
} from '../contracts/ambassador';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockAmbassadorRepository(
  options: MockRepositoryOptions = {},
): AmbassadorRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const applications = new Map<string, AmbassadorApplication>();
  const tasks = new Map<string, AmbassadorTask>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nextId(prefix: string): string {
    counter += 1;
    return `mock-${prefix}-${Date.now()}-${counter}`;
  }

  return Object.freeze({
    async getApplicationByUser(userId: string): Promise<Result<AmbassadorApplication | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const record of applications.values()) {
        if (record.userId === userId) return ok(record);
      }
      return ok(null);
    },

    async listApplications(query?: ListQuery): Promise<Result<PagedResult<AmbassadorApplication>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(applications.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async apply(input: ApplyAmbassadorInput): Promise<Result<AmbassadorApplication>> {
      if (!input.userId || input.governorateIds.length === 0 || !input.motivation.trim()) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_APPLICATION' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const record of applications.values()) {
        if (record.userId === input.userId) {
          return { ok: false, error: AppError.conflict({ code: 'ALREADY_APPLIED' }) };
        }
      }
      const now = new Date().toISOString();
      const record: AmbassadorApplication = Object.freeze({
        id: nextId('ambassador-application'),
        userId: input.userId,
        governorateIds: Object.freeze([...input.governorateIds]),
        motivation: input.motivation.trim().slice(0, 1000),
        status: 'pending' as const,
        decidedBy: null,
        decidedAt: null,
        reasonKey: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      applications.set(record.id, record);
      return ok(record);
    },

    async decideApplication(
      id: string,
      decision: 'approved' | 'rejected',
      decidedBy: string,
      reasonKey?: string | null,
    ): Promise<Result<AmbassadorApplication>> {
      if (decision === 'rejected' && !reasonKey) {
        return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = applications.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      const updated: AmbassadorApplication = Object.freeze({
        ...existing,
        status: decision,
        decidedBy,
        decidedAt: now,
        reasonKey: reasonKey ?? null,
        updatedAt: now,
      });
      applications.set(id, updated);
      return ok(updated);
    },

    async createTask(input: CreateAmbassadorTaskInput): Promise<Result<AmbassadorTask>> {
      if (!input.ambassadorId || !input.governorateId || !input.titleKey) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_TASK' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const task: AmbassadorTask = Object.freeze({
        id: nextId('ambassador-task'),
        ambassadorId: input.ambassadorId,
        kind: input.kind,
        governorateId: input.governorateId,
        titleKey: input.titleKey,
        status: 'assigned' as const,
        nominatedPartnerId: null,
        photoFileIds: Object.freeze([]),
        submittedAt: null,
        decidedBy: null,
        decidedAt: null,
        reasonKey: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      tasks.set(task.id, task);
      return ok(task);
    },

    async listTasks(ambassadorId: string): Promise<Result<readonly AmbassadorTask[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(tasks.values()).filter((t) => t.ambassadorId === ambassadorId));
    },

    async listTasksByRegion(governorateId: string): Promise<Result<readonly AmbassadorTask[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(tasks.values()).filter((t) => t.governorateId === governorateId));
    },

    async updateTask(
      id: string,
      input: UpdateAmbassadorTaskInput,
    ): Promise<Result<AmbassadorTask>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = tasks.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'TASK_NOT_FOUND' }) };
      const updated: AmbassadorTask = Object.freeze({
        ...existing,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.nominatedPartnerId !== undefined && {
          nominatedPartnerId: input.nominatedPartnerId,
        }),
        ...(input.photoFileIds !== undefined && {
          photoFileIds: Object.freeze([...input.photoFileIds]),
        }),
        ...(input.submittedAt !== undefined && { submittedAt: input.submittedAt }),
        ...(input.decidedBy !== undefined && { decidedBy: input.decidedBy }),
        ...(input.decidedAt !== undefined && { decidedAt: input.decidedAt }),
        ...(input.reasonKey !== undefined && { reasonKey: input.reasonKey }),
        updatedAt: new Date().toISOString(),
      });
      tasks.set(id, updated);
      return ok(updated);
    },
  });
}
