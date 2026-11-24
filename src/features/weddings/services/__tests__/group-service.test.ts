import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockNotificationRepository } from '@/repositories/mock/notification';
import { createMockWeddingRepository } from '@/repositories/mock/wedding';
import { createMockWeddingGroupRepository } from '@/repositories/mock/wedding-group';
import {
  createGroup,
  decideJoin,
  inviteMember,
  requestJoin,
  transitionGroup,
  withdrawMember,
} from '../group-service';

function setup() {
  return {
    weddings: createMockWeddingRepository(),
    groups: createMockWeddingGroupRepository(),
    notifications: createMockNotificationRepository(),
    audit: createMockAuditRepository(),
  };
}

const base = {
  organizerId: 'organizer-1',
  title: 'Demo group',
  governorateId: 'sanaa',
  districtId: null,
  city: null,
  scheduledDate: '2026-06-15T16:00:00.000Z',
  alternateDate: null,
  targetCount: 4,
  description: null,
  maxGroupSize: 12,
};

describe('group service', () => {
  it('creates an open group with the organizer as an active member', async () => {
    const deps = setup();
    const created = await createGroup(deps, base);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('open');
    expect(created.value.title).toBe('Demo group');
    const member = await deps.groups.getMember(created.value.id, 'organizer-1');
    if (member.ok) expect(member.value?.role).toBe('organizer');
  });

  it('enforces the configured ceiling', async () => {
    const deps = setup();
    const result = await createGroup(deps, { ...base, targetCount: 20, maxGroupSize: 12 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('GROUP_TOO_LARGE');
  });

  it('approves a join request only by an authorized member', async () => {
    const deps = setup();
    const group = await createGroup(deps, base);
    if (!group.ok) throw new Error('setup failed');
    const request = await requestJoin(deps, group.value.id, 'u2', 'please add me', true);
    if (!request.ok) throw new Error('join failed');

    const stranger = await decideJoin(deps, group.value.id, request.value.id, 'u9', 'approved');
    expect(stranger.ok).toBe(false);

    const approved = await decideJoin(
      deps,
      group.value.id,
      request.value.id,
      'organizer-1',
      'approved',
    );
    expect(approved.ok).toBe(true);
    const member = await deps.groups.getMember(group.value.id, 'u2');
    if (member.ok) expect(member.value?.status).toBe('active');
  });

  it('rejects a duplicate member and a full group', async () => {
    const deps = setup();
    const group = await createGroup(deps, { ...base, targetCount: 2 });
    if (!group.ok) throw new Error('setup failed');
    const again = await requestJoin(deps, group.value.id, 'organizer-1', 'me again', true);
    expect(again.ok).toBe(false);

    const first = await requestJoin(deps, group.value.id, 'u2', 'join', true);
    if (first.ok) {
      await decideJoin(deps, group.value.id, first.value.id, 'organizer-1', 'approved');
    }
    const full = await requestJoin(deps, group.value.id, 'u3', 'join', true);
    expect(full.ok).toBe(false);
    if (!full.ok) expect(full.error.meta.code).toBe('GROUP_FULL');
  });

  it('notifies the invitee and requires a reason to cancel', async () => {
    const deps = setup();
    const group = await createGroup(deps, base);
    if (!group.ok) throw new Error('setup failed');
    const invite = await inviteMember(deps, group.value.id, 'organizer-1', 'u5');
    expect(invite.ok).toBe(true);
    const notes = await deps.notifications.list();
    if (notes.ok) expect(notes.value.total).toBe(1);

    const noReason = await transitionGroup(deps, group.value.id, 'organizer-1', 'cancelled');
    expect(noReason.ok).toBe(false);
    const cancelled = await transitionGroup(deps, group.value.id, 'organizer-1', 'cancelled', {
      reasonKey: 'weddings:members.rejectReason',
    });
    expect(cancelled.ok).toBe(true);
  });

  it('blocks the agreed transition until the budget is adopted', async () => {
    const deps = setup();
    const group = await createGroup(deps, base);
    if (!group.ok) throw new Error('setup failed');
    await transitionGroup(deps, group.value.id, 'organizer-1', 'planning');
    const early = await transitionGroup(deps, group.value.id, 'organizer-1', 'agreed');
    expect(early.ok).toBe(false);
    if (!early.ok) expect(early.error.meta.code).toBe('BUDGET_NOT_ADOPTED');
    const adopted = await transitionGroup(deps, group.value.id, 'organizer-1', 'agreed', {
      budgetAdopted: true,
    });
    expect(adopted.ok).toBe(true);
  });

  it('does not let the organizer withdraw instead of cancelling', async () => {
    const deps = setup();
    const group = await createGroup(deps, base);
    if (!group.ok) throw new Error('setup failed');
    const result = await withdrawMember(
      deps,
      group.value.id,
      'organizer-1',
      base.scheduledDate,
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(result.ok).toBe(false);
  });
});
