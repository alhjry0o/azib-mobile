import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  BudgetItem,
  BudgetVersion,
  CreateBudgetItemInput,
  WeddingAgreement,
} from '@/repositories/contracts/wedding-budget';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { computeCostSharing, type CostSharingReport } from '../engine/cost-sharing';
import { allApproved, missingApprovals, requiredApprovals } from '../state/approvals';
import {
  acknowledgeAgreement,
  addBudgetItem,
  adoptBudget,
  approveShare,
  createBudgetVersion,
  removeBudgetItem,
  reissueVersion,
  setSplit,
  type SplitInput,
} from '../services/budget-service';

export interface BudgetPayload {
  readonly version: BudgetVersion | null;
  readonly items: readonly BudgetItem[];
  readonly memberIds: readonly string[];
  readonly approvedIds: readonly string[];
  readonly missingIds: readonly string[];
  readonly unanimous: boolean;
  readonly report: CostSharingReport | null;
  readonly reportErrorCode: string | null;
  readonly agreement: WeddingAgreement | null;
}

export interface WeddingBudgetApi {
  readonly data: BudgetPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  createVersion(input: SplitInput): Promise<Result<BudgetVersion>>;
  addItem(input: Omit<CreateBudgetItemInput, 'versionId' | 'groupId'>): Promise<Result<BudgetItem>>;
  removeItem(itemId: string): Promise<Result<void>>;
  setSplit(input: SplitInput): Promise<Result<BudgetVersion>>;
  approve(): Promise<Result<void>>;
  adopt(): Promise<Result<WeddingAgreement>>;
  acknowledge(): Promise<Result<WeddingAgreement>>;
  reissue(): Promise<Result<BudgetVersion>>;
  refetch(): void;
}

export function useWeddingBudget(groupId: string): WeddingBudgetApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      budgets: container.repositories.weddingBudgets,
      groups: container.repositories.weddingGroups,
      weddings: container.repositories.weddings,
      notifications: container.repositories.notifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['weddings', 'budget', container.mode, groupId],
    enabled: container.mode === 'demo' && groupId.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<BudgetPayload>> => {
      const versions = await deps.budgets.listVersions(groupId);
      if (!versions.ok) return versions;
      const version = versions.value.reduce<BudgetVersion | null>(
        (best, v) => (best === null || v.version > best.version ? v : best),
        null,
      );
      const members = await deps.groups.listMembers(groupId);
      if (!members.ok) return members;
      const memberIds = requiredApprovals(
        members.value.filter((m) => m.status === 'active').map((m) => m.userId),
      );
      const agreements = await deps.budgets.listAgreements(groupId);
      const agreement = agreements.ok
        ? (agreements.value[agreements.value.length - 1] ?? null)
        : null;

      if (!version) {
        return {
          ok: true,
          value: {
            version: null,
            items: [],
            memberIds,
            approvedIds: [],
            missingIds: memberIds,
            unanimous: false,
            report: null,
            reportErrorCode: null,
            agreement,
          },
        };
      }

      const items = await deps.budgets.listItems(version.id);
      if (!items.ok) return items;
      const approvals = await deps.budgets.listApprovals(version.id);
      if (!approvals.ok) return approvals;
      const approvedIds = approvals.value.filter((a) => a.approved).map((a) => a.userId);
      const report = computeCostSharing({
        members: memberIds.map((memberId) => ({
          memberId,
          weight: version.weights.find((w) => w.memberId === memberId)?.weight ?? 1,
          customAmount:
            version.customShares.find((c) => c.memberId === memberId)?.amount ?? 0,
        })),
        items: items.value.map((i) => ({
          id: i.id,
          scope: i.scope,
          amount: i.amount,
          memberId: i.memberId ?? null,
        })),
        mode: version.splitMode,
      });

      return {
        ok: true,
        value: {
          version,
          items: items.value,
          memberIds,
          approvedIds,
          missingIds: missingApprovals(memberIds, approvals.value),
          unanimous: allApproved(memberIds, approvals.value),
          report: report.ok ? report.value : null,
          reportErrorCode: report.ok ? null : (report.error.meta.code ?? 'UNKNOWN'),
          agreement,
        },
      };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setActionError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['weddings'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const versionId = query.data?.ok ? (query.data.value.version?.id ?? null) : null;
  const agreementId = query.data?.ok ? (query.data.value.agreement?.id ?? null) : null;

  const guard = useCallback((): string | null => userId, [userId]);

  const createVersion = useCallback(
    (input: SplitInput) =>
      run(async () => {
        const id = guard();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return createBudgetVersion(deps, groupId, id, input);
      }),
    [run, guard, deps, groupId],
  );

  const addItem = useCallback(
    (input: Omit<CreateBudgetItemInput, 'versionId' | 'groupId'>) =>
      run(async () => {
        const id = guard();
        if (!id || !versionId) return { ok: false, error: AppError.conflict({ code: 'NO_VERSION' }) };
        return addBudgetItem(deps, groupId, versionId, id, input);
      }),
    [run, guard, deps, groupId, versionId],
  );

  const removeItem = useCallback(
    (itemId: string) =>
      run(async () => {
        const id = guard();
        if (!id || !versionId) return { ok: false, error: AppError.conflict({ code: 'NO_VERSION' }) };
        return removeBudgetItem(deps, groupId, versionId, itemId, id);
      }),
    [run, guard, deps, groupId, versionId],
  );

  const setSplitAction = useCallback(
    (input: SplitInput) =>
      run(async () => {
        const id = guard();
        if (!id || !versionId) return { ok: false, error: AppError.conflict({ code: 'NO_VERSION' }) };
        return setSplit(deps, groupId, versionId, id, input);
      }),
    [run, guard, deps, groupId, versionId],
  );

  const approve = useCallback(
    () =>
      run(async () => {
        const id = guard();
        if (!id || !versionId) return { ok: false, error: AppError.conflict({ code: 'NO_VERSION' }) };
        return approveShare(deps, groupId, versionId, id);
      }),
    [run, guard, deps, groupId, versionId],
  );

  const adopt = useCallback(
    () =>
      run(async () => {
        const id = guard();
        if (!id || !versionId) return { ok: false, error: AppError.conflict({ code: 'NO_VERSION' }) };
        return adoptBudget(deps, groupId, versionId, id);
      }),
    [run, guard, deps, groupId, versionId],
  );

  const acknowledge = useCallback(
    () =>
      run(async () => {
        const id = guard();
        if (!id || !agreementId) {
          return { ok: false, error: AppError.conflict({ code: 'NO_AGREEMENT' }) };
        }
        return acknowledgeAgreement(deps, groupId, agreementId, id);
      }),
    [run, guard, deps, groupId, agreementId],
  );

  const reissue = useCallback(
    () =>
      run(async () => {
        const id = guard();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return reissueVersion(deps, groupId, id);
      }),
    [run, guard, deps, groupId],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    busy,
    actionError,
    createVersion,
    addItem,
    removeItem,
    setSplit: setSplitAction,
    approve,
    adopt,
    acknowledge,
    reissue,
    refetch,
  };
}
