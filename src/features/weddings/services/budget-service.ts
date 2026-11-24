// Budget versions, unanimous approvals and adoption. The group only reaches
// 'agreed' when EVERY active member approved the current version — the flag
// passed to transitionGroup is derived here, never supplied by a caller.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { NotificationRepository } from '@/repositories/contracts/notification';
import type { WeddingRepository } from '@/repositories/contracts/wedding';
import type {
  BudgetItem,
  BudgetVersion,
  CreateBudgetItemInput,
  MemberCustomShare,
  MemberWeight,
  SplitMode,
  WeddingAgreement,
  WeddingBudgetRepository,
} from '@/repositories/contracts/wedding-budget';
import type {
  GroupRole,
  WeddingGroupRepository,
} from '@/repositories/contracts/wedding-group';
import { computeCostSharing } from '../engine/cost-sharing';
import { allApproved, bumpVersion, missingApprovals, requiredApprovals } from '../state/approvals';
import { toGroupStatus } from '../state/group-machine';
import { can, type GroupPermission } from '../state/roles';
import { transitionGroup } from './group-service';
import { notifyWedding } from './wedding-notifications';

export interface BudgetDeps {
  readonly budgets: WeddingBudgetRepository;
  readonly groups: WeddingGroupRepository;
  readonly weddings: WeddingRepository;
  readonly notifications: NotificationRepository;
  readonly audit: AuditRepository;
}

async function requirePermission(
  deps: BudgetDeps,
  groupId: string,
  userId: string,
  permission: GroupPermission,
): Promise<Result<GroupRole>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!can(member.value.role, permission)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return ok(member.value.role);
}

async function activeMemberIds(
  deps: BudgetDeps,
  groupId: string,
): Promise<Result<readonly string[]>> {
  const listed = await deps.groups.listMembers(groupId);
  if (!listed.ok) return listed;
  return ok(requiredApprovals(listed.value.filter((m) => m.status === 'active').map((m) => m.userId)));
}

async function notifyMembers(deps: BudgetDeps, groupId: string, exceptId: string): Promise<void> {
  const listed = await deps.groups.listMembers(groupId);
  if (!listed.ok) return;
  for (const member of listed.value) {
    if (member.status === 'active' && member.userId !== exceptId) {
      await notifyWedding(deps.notifications, member.userId, 'budget');
    }
  }
}

/** Editing an adopted version reopens planning so approvals start over. */
async function reopenIfAdopted(
  deps: BudgetDeps,
  groupId: string,
  version: BudgetVersion,
  actorId: string,
): Promise<void> {
  if (version.status !== 'adopted') return;
  await deps.budgets.updateVersion(version.id, { status: 'draft', adoptedAt: null });
  const group = await deps.weddings.getById(groupId);
  if (group.ok && group.value && toGroupStatus(group.value.status) === 'agreed') {
    await transitionGroup(deps, groupId, actorId, 'planning');
  }
}

export interface SplitInput {
  readonly splitMode: SplitMode;
  readonly weights?: readonly MemberWeight[];
  readonly customShares?: readonly MemberCustomShare[];
}

export async function createBudgetVersion(
  deps: BudgetDeps,
  groupId: string,
  actorId: string,
  input: SplitInput,
): Promise<Result<BudgetVersion>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'edit_budget');
  if (!allowed.ok) return allowed;
  const versions = await deps.budgets.listVersions(groupId);
  if (!versions.ok) return versions;
  const highest = versions.value.reduce((max, v) => (v.version > max ? v.version : max), 0);
  const created = await deps.budgets.createVersion({
    groupId,
    version: bumpVersion(highest),
    splitMode: input.splitMode,
    weights: input.weights ?? [],
    customShares: input.customShares ?? [],
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId,
    action: 'wedding.budget.version',
    target: `wedding:${groupId}`,
    meta: { version: created.value.version },
  });
  return ok(created.value);
}

export async function addBudgetItem(
  deps: BudgetDeps,
  groupId: string,
  versionId: string,
  actorId: string,
  input: Omit<CreateBudgetItemInput, 'versionId' | 'groupId'>,
): Promise<Result<BudgetItem>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'edit_budget');
  if (!allowed.ok) return allowed;
  const version = await deps.budgets.getVersion(versionId);
  if (!version.ok) return version;
  if (!version.value) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };

  const added = await deps.budgets.addItem({ ...input, versionId, groupId });
  if (!added.ok) return added;
  await reopenIfAdopted(deps, groupId, version.value, actorId);
  await notifyMembers(deps, groupId, actorId);
  await deps.audit.append({
    actorId,
    action: 'wedding.budget.item.added',
    target: `wedding:${groupId}`,
    meta: { to: 'draft' },
  });
  return ok(added.value);
}

export async function removeBudgetItem(
  deps: BudgetDeps,
  groupId: string,
  versionId: string,
  itemId: string,
  actorId: string,
): Promise<Result<void>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'edit_budget');
  if (!allowed.ok) return allowed;
  const version = await deps.budgets.getVersion(versionId);
  if (!version.ok) return version;
  if (!version.value) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };
  const removed = await deps.budgets.removeItem(itemId);
  if (!removed.ok) return removed;
  await reopenIfAdopted(deps, groupId, version.value, actorId);
  await notifyMembers(deps, groupId, actorId);
  return ok(undefined);
}

export async function setSplit(
  deps: BudgetDeps,
  groupId: string,
  versionId: string,
  actorId: string,
  input: SplitInput,
): Promise<Result<BudgetVersion>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'edit_budget');
  if (!allowed.ok) return allowed;
  const version = await deps.budgets.getVersion(versionId);
  if (!version.ok) return version;
  if (!version.value) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };
  const updated = await deps.budgets.updateVersion(versionId, {
    splitMode: input.splitMode,
    weights: input.weights ?? [],
    customShares: input.customShares ?? [],
  });
  if (!updated.ok) return updated;
  await reopenIfAdopted(deps, groupId, version.value, actorId);
  await notifyMembers(deps, groupId, actorId);
  return ok(updated.value);
}

export async function approveShare(
  deps: BudgetDeps,
  groupId: string,
  versionId: string,
  userId: string,
): Promise<Result<void>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  const approved = await deps.budgets.approveShare(versionId, userId);
  if (!approved.ok) return approved;
  await deps.audit.append({
    actorId: userId,
    action: 'wedding.budget.approved',
    target: `wedding:${groupId}`,
  });
  return ok(undefined);
}

/** Derives budgetAdopted from unanimous approval — never from a caller flag. */
export async function adoptBudget(
  deps: BudgetDeps,
  groupId: string,
  versionId: string,
  actorId: string,
): Promise<Result<WeddingAgreement>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'adopt_budget');
  if (!allowed.ok) return allowed;
  const version = await deps.budgets.getVersion(versionId);
  if (!version.ok) return version;
  if (!version.value) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };

  const snapshot = version.value;
  const required = await activeMemberIds(deps, groupId);
  if (!required.ok) return required;
  const approvals = await deps.budgets.listApprovals(versionId);
  if (!approvals.ok) return approvals;
  if (!allApproved(required.value, approvals.value)) {
    return {
      ok: false,
      error: AppError.conflict({
        code: 'APPROVALS_INCOMPLETE',
        context: { missing: missingApprovals(required.value, approvals.value).length },
      }),
    };
  }

  const items = await deps.budgets.listItems(versionId);
  if (!items.ok) return items;
  const report = computeCostSharing({
    members: required.value.map((memberId) => ({
      memberId,
      weight: snapshot.weights.find((w) => w.memberId === memberId)?.weight ?? 1,
      customAmount: snapshot.customShares.find((c) => c.memberId === memberId)?.amount ?? 0,
    })),
    items: items.value.map((i) => ({
      id: i.id,
      scope: i.scope,
      amount: i.amount,
      memberId: i.memberId ?? null,
    })),
    mode: version.value.splitMode,
  });
  if (!report.ok) return report;

  const adopted = await deps.budgets.updateVersion(versionId, {
    status: 'adopted',
    adoptedAt: new Date().toISOString(),
  });
  if (!adopted.ok) return adopted;

  const current = await deps.weddings.getById(groupId);
  if (!current.ok) return current;
  if (current.value && toGroupStatus(current.value.status) === 'open') {
    const planned = await transitionGroup(deps, groupId, actorId, 'planning');
    if (!planned.ok) return planned;
  }

  const moved = await transitionGroup(deps, groupId, actorId, 'agreed', { budgetAdopted: true });
  if (!moved.ok) return moved;

  const agreement = await deps.budgets.createAgreement({
    groupId,
    versionId,
    summaryKey: 'weddings:agreement.summary',
  });
  if (!agreement.ok) return agreement;
  await notifyMembers(deps, groupId, actorId);
  await deps.audit.append({
    actorId,
    action: 'wedding.budget.adopted',
    target: `wedding:${groupId}`,
    meta: { to: 'agreed', version: version.value.version },
  });
  return ok(agreement.value);
}

export async function acknowledgeAgreement(
  deps: BudgetDeps,
  groupId: string,
  agreementId: string,
  userId: string,
): Promise<Result<WeddingAgreement>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  const acknowledged = await deps.budgets.acknowledgeAgreement(agreementId, userId);
  if (!acknowledged.ok) return acknowledged;
  await deps.audit.append({
    actorId: userId,
    action: 'wedding.agreement.acknowledged',
    target: `wedding:${groupId}`,
  });
  return ok(acknowledged.value);
}

/** Re-issues a version after membership change (withdrawal / new member). */
export async function reissueVersion(
  deps: BudgetDeps,
  groupId: string,
  actorId: string,
): Promise<Result<BudgetVersion>> {
  const allowed = await requirePermission(deps, groupId, actorId, 'edit_budget');
  if (!allowed.ok) return allowed;
  const versions = await deps.budgets.listVersions(groupId);
  if (!versions.ok) return versions;
  const latest = versions.value.reduce<BudgetVersion | null>(
    (best, v) => (best === null || v.version > best.version ? v : best),
    null,
  );
  if (!latest) return { ok: false, error: AppError.notFound({ code: 'VERSION_NOT_FOUND' }) };
  const items = await deps.budgets.listItems(latest.id);
  if (!items.ok) return items;
  const active = await activeMemberIds(deps, groupId);
  if (!active.ok) return active;

  const created = await createBudgetVersion(deps, groupId, actorId, {
    splitMode: latest.splitMode === 'custom' ? 'equal' : latest.splitMode,
    weights: latest.weights.filter((w) => active.value.includes(w.memberId)),
  });
  if (!created.ok) return created;
  for (const item of items.value) {
    if (item.scope === 'individual' && !active.value.includes(item.memberId ?? '')) continue;
    await deps.budgets.addItem({
      versionId: created.value.id,
      groupId,
      category: item.category,
      labelKey: item.labelKey,
      amount: item.amount,
      scope: item.scope,
      memberId: item.memberId ?? null,
      offerId: item.offerId ?? null,
    });
  }
  await reopenIfAdopted(deps, groupId, latest, actorId);
  await notifyMembers(deps, groupId, actorId);
  return ok(created.value);
}
