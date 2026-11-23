import { createMockWeddingGroupRepository } from '../wedding-group';

describe('MockWeddingGroupRepository', () => {
  it('adds a member once and finds it by group + user', async () => {
    const repo = createMockWeddingGroupRepository();
    const added = await repo.addMember({
      groupId: 'g1',
      userId: 'u1',
      role: 'organizer',
      displayNameConsent: true,
    });
    expect(added.ok).toBe(true);
    const duplicate = await repo.addMember({
      groupId: 'g1',
      userId: 'u1',
      displayNameConsent: true,
    });
    expect(duplicate.ok).toBe(false);
    const found = await repo.getMember('g1', 'u1');
    expect(found.ok).toBe(true);
    if (found.ok) expect(found.value?.role).toBe('organizer');
  });

  it('requires display-name consent on a join request', async () => {
    const repo = createMockWeddingGroupRepository();
    const bad = await repo.createJoinRequest({
      groupId: 'g1',
      userId: 'u2',
      message: 'hello',
      displayNameConsent: false,
    });
    expect(bad.ok).toBe(false);
    const good = await repo.createJoinRequest({
      groupId: 'g1',
      userId: 'u2',
      message: 'hello',
      displayNameConsent: true,
    });
    expect(good.ok).toBe(true);
  });

  it('requires a reason to reject and cannot decide twice', async () => {
    const repo = createMockWeddingGroupRepository();
    const created = await repo.createJoinRequest({
      groupId: 'g1',
      userId: 'u2',
      message: 'hello',
      displayNameConsent: true,
    });
    if (!created.ok) throw new Error('setup failed');
    const noReason = await repo.decideJoinRequest(created.value.id, {
      decision: 'rejected',
      decidedBy: 'organizer',
    });
    expect(noReason.ok).toBe(false);
    const decided = await repo.decideJoinRequest(created.value.id, {
      decision: 'approved',
      decidedBy: 'organizer',
    });
    expect(decided.ok).toBe(true);
    const again = await repo.decideJoinRequest(created.value.id, {
      decision: 'approved',
      decidedBy: 'organizer',
    });
    expect(again.ok).toBe(false);
  });

  it('tracks invitations and member withdrawal', async () => {
    const repo = createMockWeddingGroupRepository();
    const invite = await repo.createInvitation({
      groupId: 'g1',
      inviterId: 'u1',
      inviteeId: 'u3',
    });
    expect(invite.ok).toBe(true);
    if (invite.ok) {
      const accepted = await repo.updateInvitation(invite.value.id, 'accepted');
      expect(accepted.ok).toBe(true);
    }
    const member = await repo.addMember({
      groupId: 'g1',
      userId: 'u3',
      displayNameConsent: true,
    });
    if (member.ok) {
      const withdrawn = await repo.updateMember(member.value.id, {
        status: 'withdrawn',
        withdrawnAt: '2026-05-01T00:00:00.000Z',
      });
      expect(withdrawn.ok).toBe(true);
      if (withdrawn.ok) expect(withdrawn.value.status).toBe('withdrawn');
    }
    const listed = await repo.listMembers('g1');
    if (listed.ok) expect(listed.value.length).toBe(1);
  });

  it('propagates forced errors', async () => {
    const repo = createMockWeddingGroupRepository({ forceErrorKind: 'Network' });
    const result = await repo.listMembers('g1');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Network');
  });
});
