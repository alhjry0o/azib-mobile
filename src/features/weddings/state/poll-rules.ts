// Pure voting rules: one vote per participant, quorum, declared tie-break.
import type { PollOption, TieBreakRule } from '@/repositories/contracts/wedding-poll';

export interface PollVoteInput {
  readonly userId: string;
  readonly optionId: string;
}

export interface PollTallyInput {
  readonly options: readonly PollOption[];
  readonly votes: readonly PollVoteInput[];
  readonly eligibleCount: number;
  readonly quorumPercent: number;
  readonly deadline: string;
  readonly now: Date;
  readonly tieBreak: TieBreakRule;
  readonly organizerOptionId?: string | null;
}

export interface PollTally {
  readonly counts: Readonly<Record<string, number>>;
  readonly totalVotes: number;
  readonly eligibleCount: number;
  readonly quorumMet: boolean;
  readonly closed: boolean;
  readonly winnerOptionId: string | null;
  readonly tieBroken: boolean;
  readonly reasonKey: string;
}

export function canChangeVote(deadline: string, now: Date): boolean {
  const stamp = Date.parse(deadline);
  if (Number.isNaN(stamp)) return false;
  return now.getTime() < stamp;
}

export function tallyPoll(input: PollTallyInput): PollTally {
  const counts: Record<string, number> = {};
  for (const option of input.options) counts[option.id] = 0;

  const seen = new Set<string>();
  let totalVotes = 0;
  for (const vote of input.votes) {
    if (seen.has(vote.userId)) continue;
    if (counts[vote.optionId] === undefined) continue;
    seen.add(vote.userId);
    counts[vote.optionId] = (counts[vote.optionId] ?? 0) + 1;
    totalVotes += 1;
  }

  const closed = !canChangeVote(input.deadline, input.now);
  // Integer quorum check — no floating point comparison.
  const quorumMet =
    input.eligibleCount > 0 &&
    totalVotes * 100 >= input.eligibleCount * input.quorumPercent;

  if (!closed) {
    return Object.freeze({
      counts,
      totalVotes,
      eligibleCount: input.eligibleCount,
      quorumMet,
      closed,
      winnerOptionId: null,
      tieBroken: false,
      reasonKey: 'weddings:poll.reasons.open',
    });
  }
  if (totalVotes === 0) {
    return Object.freeze({
      counts,
      totalVotes,
      eligibleCount: input.eligibleCount,
      quorumMet,
      closed,
      winnerOptionId: null,
      tieBroken: false,
      reasonKey: 'weddings:poll.reasons.noVotes',
    });
  }
  if (!quorumMet) {
    return Object.freeze({
      counts,
      totalVotes,
      eligibleCount: input.eligibleCount,
      quorumMet,
      closed,
      winnerOptionId: null,
      tieBroken: false,
      reasonKey: 'weddings:poll.reasons.quorumNotMet',
    });
  }

  let max = 0;
  for (const option of input.options) {
    const value = counts[option.id] ?? 0;
    if (value > max) max = value;
  }
  const tied = input.options.filter((o) => (counts[o.id] ?? 0) === max);
  const first = tied[0] ?? input.options[0];
  if (!first) {
    return Object.freeze({
      counts,
      totalVotes,
      eligibleCount: input.eligibleCount,
      quorumMet,
      closed,
      winnerOptionId: null,
      tieBroken: false,
      reasonKey: 'weddings:poll.reasons.noVotes',
    });
  }

  if (tied.length === 1) {
    return Object.freeze({
      counts,
      totalVotes,
      eligibleCount: input.eligibleCount,
      quorumMet,
      closed,
      winnerOptionId: first.id,
      tieBroken: false,
      reasonKey: 'weddings:poll.reasons.majority',
    });
  }

  const organizerChoice = input.organizerOptionId ?? null;
  const organizerInTie =
    input.tieBreak === 'organizer_vote' &&
    organizerChoice !== null &&
    tied.some((o) => o.id === organizerChoice);

  return Object.freeze({
    counts,
    totalVotes,
    eligibleCount: input.eligibleCount,
    quorumMet,
    closed,
    winnerOptionId: organizerInTie ? organizerChoice : first.id,
    tieBroken: true,
    reasonKey: organizerInTie
      ? 'weddings:poll.reasons.tieOrganizer'
      : 'weddings:poll.reasons.tieOrder',
  });
}
