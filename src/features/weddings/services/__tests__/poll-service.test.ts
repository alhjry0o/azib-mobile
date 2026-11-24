import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockNotificationRepository } from '@/repositories/mock/notification';
import { createMockWeddingRepository } from '@/repositories/mock/wedding';
import { createMockWeddingGroupRepository } from '@/repositories/mock/wedding-group';
import { createMockWeddingPollRepository } from '@/repositories/mock/wedding-poll';
import { createGroup, decideJoin, requestJoin } from '../group-service';
import { castVote, createPoll } from '../poll-service';

function setup() {
  return {
    polls: createMockWeddingPollRepository(),
    groups: createMockWeddingGroupRepository(),
    weddings: createMockWeddingRepository(),
    notifications: createMockNotificationRepository(),
    audit: createMockAuditRepository(),
  };
}

const options = [
  { id: 'o1', labelKey: 'weddings:polls.open' },
  { id: 'o2', labelKey: 'weddings:polls.closed' },
];

describe('poll service', () => {
  async function withGroup() {
    const deps = setup();
    const group = await createGroup(
      {
        weddings: deps.weddings,
        groups: deps.groups,
        notifications: deps.notifications,
        audit: deps.audit,
      },
      {
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
      },
    );
    if (!group.ok) throw new Error('setup failed');
    return { deps, groupId: group.value.id };
  }

  it('only members with permission may create a poll', async () => {
    const { deps, groupId } = await withGroup();
    const outsider = await createPoll(deps, groupId, 'nobody', {
      questionKey: 'weddings:polls.title',
      kind: 'date',
      options,
      deadline: '2099-01-01T00:00:00.000Z',
      quorumPercent: 51,
      tieBreak: 'organizer_vote',
    });
    expect(outsider.ok).toBe(false);

    const created = await createPoll(deps, groupId, 'organizer-1', {
      questionKey: 'weddings:polls.title',
      kind: 'date',
      options,
      deadline: '2099-01-01T00:00:00.000Z',
      quorumPercent: 51,
      tieBreak: 'organizer_vote',
    });
    expect(created.ok).toBe(true);
  });

  it('non-members cannot vote and members can change their vote', async () => {
    const { deps, groupId } = await withGroup();
    const poll = await createPoll(deps, groupId, 'organizer-1', {
      questionKey: 'weddings:polls.title',
      kind: 'date',
      options,
      deadline: '2099-01-01T00:00:00.000Z',
      quorumPercent: 51,
      tieBreak: 'organizer_vote',
    });
    if (!poll.ok) throw new Error('setup failed');

    const outsider = await castVote(
      deps,
      poll.value.id,
      'nobody',
      'o1',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(outsider.ok).toBe(false);

    const groupDeps = {
      weddings: deps.weddings,
      groups: deps.groups,
      notifications: deps.notifications,
      audit: deps.audit,
    };
    const request = await requestJoin(groupDeps, groupId, 'u2', 'join', true);
    if (request.ok) {
      await decideJoin(groupDeps, groupId, request.value.id, 'organizer-1', 'approved');
    }

    await castVote(deps, poll.value.id, 'u2', 'o1', new Date('2026-01-01T00:00:00.000Z'));
    const changed = await castVote(
      deps,
      poll.value.id,
      'u2',
      'o2',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(changed.ok).toBe(true);
    const votes = await deps.polls.listVotes(poll.value.id);
    if (votes.ok) {
      expect(votes.value.length).toBe(1);
      expect(votes.value[0]?.optionId).toBe('o2');
    }
  });

  it('refuses votes after the deadline', async () => {
    const { deps, groupId } = await withGroup();
    const poll = await createPoll(deps, groupId, 'organizer-1', {
      questionKey: 'weddings:polls.title',
      kind: 'date',
      options,
      deadline: '2020-01-01T00:00:00.000Z',
      quorumPercent: 51,
      tieBreak: 'organizer_vote',
    });
    if (!poll.ok) throw new Error('setup failed');
    const late = await castVote(
      deps,
      poll.value.id,
      'organizer-1',
      'o1',
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(late.ok).toBe(false);
  });
});
