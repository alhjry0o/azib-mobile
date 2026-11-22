import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateDisbursementInputSchema } from '@/schemas/disbursement';
import type {
  CreateDisbursementInput,
  Disbursement,
  DisbursementActor,
  DisbursementEvent,
  DisbursementRepository,
  DisbursementStatus,
} from '../contracts/disbursement';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

const EVENT_TARGET: Record<DisbursementEvent['type'], DisbursementStatus> = {
  approve: 'approved',
  reject: 'rejected',
  record_payment: 'paid_recorded',
  re_record_payment: 'paid_recorded',
  beneficiary_confirm: 'confirmed_by_beneficiary',
  beneficiary_dispute: 'disputed',
};

export function createMockDisbursementRepository(
  options: MockRepositoryOptions = {},
): DisbursementRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Disbursement>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Disbursement | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async create(input: CreateDisbursementInput): Promise<Result<Disbursement>> {
      const parsed = CreateDisbursementInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const id = `mock-disbursement-${Date.now()}-${counter}`;
      const now = new Date().toISOString();
      const record: Disbursement = Object.freeze({
        id,
        applicationId: parsed.data.applicationId,
        amount: parsed.data.amount,
        currency: 'YER' as const,
        status: 'proposed' as const,
        providerReference: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
        makerId: parsed.data.makerId ?? null,
        checkerId: null,
        approvedAt: null,
        paidAt: null,
        beneficiaryConfirmedAt: null,
        rejectionReasonKey: null,
        disputeNote: null,
      });
      byId.set(id, record);
      return ok(record);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<Disbursement>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },

    async listByApplication(applicationId: string): Promise<Result<PagedResult<Disbursement>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const items = Array.from(byId.values()).filter((d) => d.applicationId === applicationId);
      return ok({ items, total: items.length, limit: items.length, offset: 0 });
    },

    async advance(
      id: string,
      event: DisbursementEvent,
      _actor: DisbursementActor,
    ): Promise<Result<Disbursement>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'DISBURSEMENT_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      const next: Disbursement = Object.freeze({
        ...existing,
        status: EVENT_TARGET[event.type],
        updatedAt: now,
        ...(event.type === 'approve' ? { checkerId: event.checkerId, approvedAt: now } : {}),
        ...(event.type === 'reject'
          ? { checkerId: event.checkerId, rejectionReasonKey: event.reasonKey }
          : {}),
        ...(event.type === 'record_payment' || event.type === 're_record_payment'
          ? { providerReference: event.providerReference, paidAt: now, disputeNote: null }
          : {}),
        ...(event.type === 'beneficiary_confirm' ? { beneficiaryConfirmedAt: now } : {}),
        ...(event.type === 'beneficiary_dispute' ? { disputeNote: event.note } : {}),
      });
      byId.set(id, next);
      return ok(next);
    },
  });
}
