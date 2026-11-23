import { createMockWeddingPollRepository } from '../wedding-poll';

const future = '2099-01-01T00:00:00.000Z';

async function poll(deadline = future) {
  const repo = createMockWeddingPollRepository();
  const created = await repo.createPoll({
    groupId: 'g1',
    questionKey: 'weddings:poll.question',
    kind: 'date',
    options: [
      { id: 'o1', labelKey: 'weddings:poll.o1' },
      { id: 'o2', labelKey: 'weddings:poll.o2' },
    ],
    deadline,
    quorumPercent: 51,
    tieBreak: 'organizer_vote',
    createdById: 'u1',
  });
  if (!created.ok) throw new Error('setup failed');
  return { repo, id: created.value.id };
}

describe('MockWeddingPollRepository', () => {
  it('rejects polls with fewer than two options or a bad quorum', async () => {
    const repo = createMockWeddingPollRepository();
    const bad = await repo.createPoll({
      groupId: 'g1',
      questionKey: 'q',
      kind: 'date',
      options: [{ id: 'o1', labelKey: 'l' }],
      deadline: future,
      quorumPercent: 51,
      tieBreak: 'organizer_vote',
      createdById: 'u1',
    });
    expect(bad.ok).toBe(false);
  });

  it('keeps exactly one vote per participant and allows changing it', async () => {
    const { repo, id } = await poll();
    await repo.castVote({ pollId: id, userId: 'u1', optionId: 'o1' });
    await repo.castVote({ pollId: id, userId: 'u1', optionId: 'o2' });
    const votes = await repo.listVotes(id);
    expect(votes.ok).toBe(true);
    if (votes.ok) {
      expect(votes.value.length).toBe(1);
      expect(votes.value[0]?.optionId).toBe('o2');
    }
  });

  it('rejects unknown options', async () => {
    const { repo, id } = await poll();
    const result = await repo.castVote({ pollId: id, userId: 'u1', optionId: 'ghost' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('UNKNOWN_OPTION');
  });

  it('refuses votes after the deadline or after closing', async () => {
    const past = await poll('2000-01-01T00:00:00.000Z');
    const late = await past.repo.castVote({ pollId: past.id, userId: 'u1', optionId: 'o1' });
    expect(late.ok).toBe(false);

    const open = await poll();
    await open.repo.closePoll(open.id);
    const closed = await open.repo.castVote({ pollId: open.id, userId: 'u1', optionId: 'o1' });
    expect(closed.ok).toBe(false);
    if (!closed.ok) expect(closed.error.meta.code).toBe('POLL_CLOSED');
  });
});
