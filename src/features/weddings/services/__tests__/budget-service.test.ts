import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockNotificationRepository } from '@/repositories/mock/notification';
import { createMockWeddingRepository } from '@/repositories/mock/wedding';
import { createMockWeddingBudgetRepository } from '@/repositories/mock/wedding-budget';
import { createMockWeddingGroupRepository } from '@/repositories/mock/wedding-group';
import {
  addBudgetItem,
  adoptBudget,
  approveShare,
  createBudgetVersion,
  reissueVersion,
} from '../budget-service';
import { createGroup, decideJoin, requestJoin } from '../group-service';

function setup() {
  return {
    budgets: createMockWeddingBudgetRepository(),
    groups: createMockWeddingGroupRepository(),
    weddings: createMockWeddingRepository(),
    notifications: createMockNotificationRepository(),
    audit: createMockAuditRepository(),
  };
}

async function groupWithTwo() {
  const deps = setup();
  const group = await createGroup(deps, {
    organizerId: 'organizer-1',
    title: 'Demo group',
    governorateId: 'sanaa',
    districtId: null,
    city: null,
    scheduledDate: '2026-06-15T16:00:00.000Z',
    alternateDate: null,
    targetCount: 6,
    description: null,
    maxGroupSize: 12,
  });
  if (!group.ok) throw new Error('setup failed');
  const request = await requestJoin(deps, group.value.id, 'member-2', 'join', true);
  if (request.ok) {
    await decideJoin(deps, group.value.id, request.value.id, 'organizer-1', 'approved');
  }
  return { deps, groupId: group.value.id };
}

describe('budget service', () => {
  it('creates numbered versions and resets approvals on a new item', async () => {
    const { deps, groupId } = await groupWithTwo();
    const version = await createBudgetVersion(deps, groupId, 'organizer-1', { splitMode: 'equal' });
    expect(version.ok).toBe(true);
    if (!version.ok) return;
    expect(version.value.version).toBe(1);

    await approveShare(deps, groupId, version.value.id, 'organizer-1');
    await addBudgetItem(deps, groupId, version.value.id, 'organizer-1', {
      category: 'hall',
      labelKey: 'Hall',
      amount: 90000,
      scope: 'shared',
    });
    const approvals = await deps.budgets.listApprovals(version.value.id);
    if (approvals.ok) expect(approvals.value.length).toBe(0);
  });

  it('refuses adoption until every active member approves', async () => {
    const { deps, groupId } = await groupWithTwo();
    const version = await createBudgetVersion(deps, groupId, 'organizer-1', { splitMode: 'equal' });
    if (!version.ok) throw new Error('setup failed');
    await addBudgetItem(deps, groupId, version.value.id, 'organizer-1', {
      category: 'hall',
      labelKey: 'Hall',
      amount: 90000,
      scope: 'shared',
    });
    await approveShare(deps, groupId, version.value.id, 'organizer-1');

    const early = await adoptBudget(deps, groupId, version.value.id, 'organizer-1');
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error.meta.code).toBe('APPROVALS_INCOMPLETE');

    await approveShare(deps, groupId, version.value.id, 'member-2');
    const adopted = await adoptBudget(deps, groupId, version.value.id, 'organizer-1');
    expect(adopted.ok).toBe(true);

    const group = await deps.weddings.getById(groupId);
    if (group.ok && group.value) expect(group.value.status).toBe('agreed');
  });

  it('reopens planning when an adopted version is edited', async () => {
    const { deps, groupId } = await groupWithTwo();
    const version = await createBudgetVersion(deps, groupId, 'organizer-1', { splitMode: 'equal' });
    if (!version.ok) throw new Error('setup failed');
    await approveShare(deps, groupId, version.value.id, 'organizer-1');
    await approveShare(deps, groupId, version.value.id, 'member-2');
    await adoptBudget(deps, groupId, version.value.id, 'organizer-1');

    await addBudgetItem(deps, groupId, version.value.id, 'organizer-1', {
      category: 'sound_light',
      labelKey: 'Sound',
      amount: 30000,
      scope: 'shared',
    });
    const group = await deps.weddings.getById(groupId);
    if (group.ok && group.value) expect(group.value.status).toBe('planning');
    const reopened = await deps.budgets.getVersion(version.value.id);
    if (reopened.ok && reopened.value) expect(reopened.value.status).toBe('draft');
  });

  it('re-issues a version after membership change', async () => {
    const { deps, groupId } = await groupWithTwo();
    const version = await createBudgetVersion(deps, groupId, 'organizer-1', { splitMode: 'equal' });
    if (!version.ok) throw new Error('setup failed');
    await addBudgetItem(deps, groupId, version.value.id, 'organizer-1', {
      category: 'hall',
      labelKey: 'Hall',
      amount: 60000,
      scope: 'shared',
    });
    const reissued = await reissueVersion(deps, groupId, 'organizer-1');
    expect(reissued.ok).toBe(true);
    if (!reissued.ok) return;
    expect(reissued.value.version).toBe(2);
    const items = await deps.budgets.listItems(reissued.value.id);
    if (items.ok) expect(items.value.length).toBe(1);
  });

  it('blocks non-organizers from adopting', async () => {
    const { deps, groupId } = await groupWithTwo();
    const version = await createBudgetVersion(deps, groupId, 'organizer-1', { splitMode: 'equal' });
    if (!version.ok) throw new Error('setup failed');
    const denied = await adoptBudget(deps, groupId, version.value.id, 'member-2');
    expect(denied.ok).toBe(false);
  });
});
