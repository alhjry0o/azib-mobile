// Size note (AGENT_RULES §1 #11): this module exceeds ~300 lines because
// versions, items, approvals, agreements and service requests share one
// in-memory store. Splitting it would duplicate the simulate/id helpers.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  BudgetItem,
  BudgetVersion,
  CreateAgreementInput,
  CreateBudgetItemInput,
  CreateBudgetVersionInput,
  CreateServiceRequestInput,
  ServiceRequest,
  ServiceRequestStatus,
  ShareApproval,
  UpdateBudgetVersionInput,
  WeddingAgreement,
  WeddingBudgetRepository,
} from '../contracts/wedding-budget';
import type { MockRepositoryOptions } from './profile';

export function createMockWeddingBudgetRepository(
  options: MockRepositoryOptions = {},
): WeddingBudgetRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const versions = new Map<string, BudgetVersion>();
  const items = new Map<string, BudgetItem>();
  const approvals = new Map<string, ShareApproval>();
  const agreements = new Map<string, WeddingAgreement>();
  const requests = new Map<string, ServiceRequest>();
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
    async getVersion(id: string): Promise<Result<BudgetVersion | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(versions.get(id) ?? null);
    },

    async listVersions(groupId: string): Promise<Result<readonly BudgetVersion[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(versions.values()).filter((v) => v.groupId === groupId));
    },

    async createVersion(input: CreateBudgetVersionInput): Promise<Result<BudgetVersion>> {
      if (!input.groupId || !Number.isInteger(input.version) || input.version < 1) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_VERSION' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const version: BudgetVersion = Object.freeze({
        id: nextId('wedding-budget'),
        groupId: input.groupId,
        version: input.version,
        status: 'draft' as const,
        splitMode: input.splitMode,
        weights: Object.freeze([...(input.weights ?? [])]),
        customShares: Object.freeze([...(input.customShares ?? [])]),
        adoptedAt: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      versions.set(version.id, version);
      return ok(version);
    },

    async updateVersion(
      id: string,
      input: UpdateBudgetVersionInput,
    ): Promise<Result<BudgetVersion>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = versions.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };
      const edited =
        input.splitMode !== undefined ||
        input.weights !== undefined ||
        input.customShares !== undefined;
      const updated: BudgetVersion = Object.freeze({
        ...existing,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.splitMode !== undefined && { splitMode: input.splitMode }),
        ...(input.weights !== undefined && { weights: Object.freeze([...input.weights]) }),
        ...(input.customShares !== undefined && {
          customShares: Object.freeze([...input.customShares]),
        }),
        ...(input.adoptedAt !== undefined && { adoptedAt: input.adoptedAt }),
        updatedAt: new Date().toISOString(),
      });
      versions.set(id, updated);
      // Any content edit resets the share approvals for this version.
      if (edited) {
        for (const [key, approval] of approvals.entries()) {
          if (approval.versionId === id) approvals.delete(key);
        }
      }
      return ok(updated);
    },

    async listItems(versionId: string): Promise<Result<readonly BudgetItem[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(items.values()).filter((i) => i.versionId === versionId));
    },

    async addItem(input: CreateBudgetItemInput): Promise<Result<BudgetItem>> {
      if (
        !input.versionId ||
        !input.labelKey ||
        !Number.isInteger(input.amount) ||
        input.amount < 0 ||
        (input.scope === 'individual' && !input.memberId)
      ) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_BUDGET_ITEM' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const item: BudgetItem = Object.freeze({
        id: nextId('wedding-item'),
        versionId: input.versionId,
        groupId: input.groupId,
        category: input.category,
        labelKey: input.labelKey,
        amount: input.amount,
        scope: input.scope,
        memberId: input.memberId ?? null,
        offerId: input.offerId ?? null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      items.set(item.id, item);
      for (const [key, approval] of approvals.entries()) {
        if (approval.versionId === input.versionId) approvals.delete(key);
      }
      return ok(item);
    },

    async removeItem(id: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = items.get(id);
      if (existing) {
        for (const [key, approval] of approvals.entries()) {
          if (approval.versionId === existing.versionId) approvals.delete(key);
        }
      }
      items.delete(id);
      return ok(undefined);
    },

    async listApprovals(versionId: string): Promise<Result<readonly ShareApproval[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(approvals.values()).filter((a) => a.versionId === versionId));
    },

    async approveShare(versionId: string, userId: string): Promise<Result<ShareApproval>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      if (!versions.has(versionId)) {
        return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      for (const existing of approvals.values()) {
        if (existing.versionId === versionId && existing.userId === userId) {
          const updated: ShareApproval = Object.freeze({
            ...existing,
            approved: true,
            approvedAt: now,
            updatedAt: now,
          });
          approvals.set(existing.id, updated);
          return ok(updated);
        }
      }
      const approval: ShareApproval = Object.freeze({
        id: nextId('wedding-approval'),
        versionId,
        userId,
        approved: true,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      approvals.set(approval.id, approval);
      return ok(approval);
    },

    async getAgreement(id: string): Promise<Result<WeddingAgreement | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(agreements.get(id) ?? null);
    },

    async listAgreements(groupId: string): Promise<Result<readonly WeddingAgreement[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(agreements.values()).filter((a) => a.groupId === groupId));
    },

    async createAgreement(input: CreateAgreementInput): Promise<Result<WeddingAgreement>> {
      if (!input.groupId || !input.versionId || !input.summaryKey) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_AGREEMENT' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const agreement: WeddingAgreement = Object.freeze({
        id: nextId('wedding-agreement'),
        groupId: input.groupId,
        versionId: input.versionId,
        summaryKey: input.summaryKey,
        acknowledgements: Object.freeze([]),
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      agreements.set(agreement.id, agreement);
      return ok(agreement);
    },

    async acknowledgeAgreement(id: string, userId: string): Promise<Result<WeddingAgreement>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = agreements.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'AGREEMENT_NOT_FOUND' }) };
      }
      if (existing.acknowledgements.includes(userId)) return ok(existing);
      const updated: WeddingAgreement = Object.freeze({
        ...existing,
        acknowledgements: Object.freeze([...existing.acknowledgements, userId]),
        updatedAt: new Date().toISOString(),
      });
      agreements.set(id, updated);
      return ok(updated);
    },

    async listServiceRequests(groupId: string): Promise<Result<readonly ServiceRequest[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(requests.values()).filter((r) => r.groupId === groupId));
    },

    async createServiceRequest(
      input: CreateServiceRequestInput,
    ): Promise<Result<ServiceRequest>> {
      if (!input.groupId || !input.partnerId || !input.categoryKey) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_SERVICE_REQUEST' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const request: ServiceRequest = Object.freeze({
        id: nextId('wedding-service'),
        groupId: input.groupId,
        partnerId: input.partnerId,
        categoryKey: input.categoryKey,
        message: input.message.slice(0, 500),
        status: 'sent' as const,
        reply: null,
        decidedAt: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      requests.set(request.id, request);
      return ok(request);
    },

    async updateServiceRequest(
      id: string,
      status: ServiceRequestStatus,
      reply?: string | null,
    ): Promise<Result<ServiceRequest>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = requests.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'SERVICE_REQUEST_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      const updated: ServiceRequest = Object.freeze({
        ...existing,
        status,
        reply: reply ?? existing.reply ?? null,
        decidedAt: status === 'sent' ? null : now,
        updatedAt: now,
      });
      requests.set(id, updated);
      return ok(updated);
    },
  });
}
