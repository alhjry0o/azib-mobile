import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export type PollKind = 'date' | 'venue' | 'other';
export type PollStatus = 'open' | 'closed';
/** Declared tie-break policy, shown to participants before voting. */
export type TieBreakRule = 'organizer_vote' | 'option_order';

export interface PollOption {
  readonly id: string;
  readonly labelKey: string;
}

export interface WeddingPoll extends BaseEntity {
  readonly groupId: string;
  readonly questionKey: string;
  readonly kind: PollKind;
  readonly options: readonly PollOption[];
  readonly deadline: string;
  readonly quorumPercent: number;
  readonly tieBreak: TieBreakRule;
  readonly status: PollStatus;
  readonly createdById: string;
}

export interface WeddingVote extends BaseEntity {
  readonly pollId: string;
  readonly userId: string;
  readonly optionId: string;
  readonly castAt: string;
}

export interface CreatePollInput {
  readonly groupId: string;
  readonly questionKey: string;
  readonly kind: PollKind;
  readonly options: readonly PollOption[];
  readonly deadline: string;
  readonly quorumPercent: number;
  readonly tieBreak: TieBreakRule;
  readonly createdById: string;
}

export interface CastVoteInput {
  readonly pollId: string;
  readonly userId: string;
  readonly optionId: string;
}

export interface WeddingPollRepository {
  getPoll(id: string): Promise<Result<WeddingPoll | null>>;
  listPolls(groupId: string): Promise<Result<readonly WeddingPoll[]>>;
  createPoll(input: CreatePollInput): Promise<Result<WeddingPoll>>;
  closePoll(id: string): Promise<Result<WeddingPoll>>;
  /** One vote per participant; re-casting replaces it until the deadline. */
  castVote(input: CastVoteInput): Promise<Result<WeddingVote>>;
  getVote(pollId: string, userId: string): Promise<Result<WeddingVote | null>>;
  listVotes(pollId: string): Promise<Result<readonly WeddingVote[]>>;
}
