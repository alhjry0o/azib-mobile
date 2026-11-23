import { canChangeVote, tallyPoll } from '../poll-rules';

const options = [
  { id: 'o1', labelKey: 'weddings:poll.o1' },
  { id: 'o2', labelKey: 'weddings:poll.o2' },
];
const deadline = '2026-05-01T00:00:00.000Z';
const after = new Date('2026-05-02T00:00:00.000Z');
const before = new Date('2026-04-01T00:00:00.000Z');

describe('poll rules', () => {
  it('allows changing a vote before the deadline only', () => {
    expect(canChangeVote(deadline, before)).toBe(true);
    expect(canChangeVote(deadline, after)).toBe(false);
  });

  it('counts one vote per participant', () => {
    const tally = tallyPoll({
      options,
      votes: [
        { userId: 'a', optionId: 'o1' },
        { userId: 'a', optionId: 'o2' },
        { userId: 'b', optionId: 'o1' },
      ],
      eligibleCount: 2,
      quorumPercent: 50,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
    });
    expect(tally.totalVotes).toBe(2);
    expect(tally.counts.o1).toBe(2);
    expect(tally.counts.o2).toBe(0);
  });

  it('has no winner while the poll is open', () => {
    const tally = tallyPoll({
      options,
      votes: [{ userId: 'a', optionId: 'o1' }],
      eligibleCount: 1,
      quorumPercent: 50,
      deadline,
      now: before,
      tieBreak: 'organizer_vote',
    });
    expect(tally.closed).toBe(false);
    expect(tally.winnerOptionId).toBeNull();
  });

  it('requires quorum before declaring a winner', () => {
    const tally = tallyPoll({
      options,
      votes: [{ userId: 'a', optionId: 'o1' }],
      eligibleCount: 10,
      quorumPercent: 51,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
    });
    expect(tally.quorumMet).toBe(false);
    expect(tally.winnerOptionId).toBeNull();
    expect(tally.reasonKey).toBe('weddings:poll.reasons.quorumNotMet');
  });

  it('breaks a tie with the organizer vote when declared', () => {
    const tally = tallyPoll({
      options,
      votes: [
        { userId: 'a', optionId: 'o1' },
        { userId: 'b', optionId: 'o2' },
      ],
      eligibleCount: 2,
      quorumPercent: 50,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
      organizerOptionId: 'o2',
    });
    expect(tally.tieBroken).toBe(true);
    expect(tally.winnerOptionId).toBe('o2');
    expect(tally.reasonKey).toBe('weddings:poll.reasons.tieOrganizer');
  });

  it('falls back to the declared option order when the organizer did not vote in the tie', () => {
    const tally = tallyPoll({
      options,
      votes: [
        { userId: 'a', optionId: 'o1' },
        { userId: 'b', optionId: 'o2' },
      ],
      eligibleCount: 2,
      quorumPercent: 50,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
      organizerOptionId: null,
    });
    expect(tally.winnerOptionId).toBe('o1');
    expect(tally.reasonKey).toBe('weddings:poll.reasons.tieOrder');
  });

  it('reports a plain majority without a tie', () => {
    const tally = tallyPoll({
      options,
      votes: [
        { userId: 'a', optionId: 'o2' },
        { userId: 'b', optionId: 'o2' },
        { userId: 'c', optionId: 'o1' },
      ],
      eligibleCount: 3,
      quorumPercent: 51,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
    });
    expect(tally.winnerOptionId).toBe('o2');
    expect(tally.tieBroken).toBe(false);
  });

  it('handles zero votes honestly', () => {
    const tally = tallyPoll({
      options,
      votes: [],
      eligibleCount: 3,
      quorumPercent: 51,
      deadline,
      now: after,
      tieBreak: 'organizer_vote',
    });
    expect(tally.winnerOptionId).toBeNull();
    expect(tally.reasonKey).toBe('weddings:poll.reasons.noVotes');
  });
});
