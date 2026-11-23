import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CastVoteInput,
  CreatePollInput,
  WeddingPoll,
  WeddingPollRepository,
  WeddingVote,
} from '../contracts/wedding-poll';
import type { MockRepositoryOptions } from './profile';

export function createMockWeddingPollRepository(
  options: MockRepositoryOptions = {},
): WeddingPollRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const polls = new Map<string, WeddingPoll>();
  const votes = new Map<string, WeddingVote>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nextId(prefix: string): string {
    counter += 1;
    return `mock-${prefix}-${Date.now()}-${counter}`;
  }

  return Object.freeze({
    async getPoll(id: string): Promise<Result<WeddingPoll | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(polls.get(id) ?? null);
    },

    async listPolls(groupId: string): Promise<Result<readonly WeddingPoll[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(polls.values()).filter((p) => p.groupId === groupId));
    },

    async createPoll(input: CreatePollInput): Promise<Result<WeddingPoll>> {
      if (
        !input.groupId ||
        !input.questionKey ||
        input.options.length < 2 ||
        !Number.isInteger(input.quorumPercent) ||
        input.quorumPercent < 1 ||
        input.quorumPercent > 100 ||
        Number.isNaN(Date.parse(input.deadline))
      ) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_POLL' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const poll: WeddingPoll = Object.freeze({
        id: nextId('wedding-poll'),
        groupId: input.groupId,
        questionKey: input.questionKey,
        kind: input.kind,
        options: Object.freeze([...input.options]),
        deadline: input.deadline,
        quorumPercent: input.quorumPercent,
        tieBreak: input.tieBreak,
        status: 'open' as const,
        createdById: input.createdById,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      polls.set(poll.id, poll);
      return ok(poll);
    },

    async closePoll(id: string): Promise<Result<WeddingPoll>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = polls.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'POLL_NOT_FOUND' }) };
      const updated: WeddingPoll = Object.freeze({
        ...existing,
        status: 'closed' as const,
        updatedAt: new Date().toISOString(),
      });
      polls.set(id, updated);
      return ok(updated);
    },

    async castVote(input: CastVoteInput): Promise<Result<WeddingVote>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const poll = polls.get(input.pollId);
      if (!poll) return { ok: false, error: AppError.notFound({ code: 'POLL_NOT_FOUND' }) };
      if (poll.status === 'closed' || Date.now() >= Date.parse(poll.deadline)) {
        return { ok: false, error: AppError.conflict({ code: 'POLL_CLOSED' }) };
      }
      if (!poll.options.some((o) => o.id === input.optionId)) {
        return { ok: false, error: AppError.validation({ code: 'UNKNOWN_OPTION' }) };
      }
      const now = new Date().toISOString();
      for (const existing of votes.values()) {
        if (existing.pollId === input.pollId && existing.userId === input.userId) {
          const updated: WeddingVote = Object.freeze({
            ...existing,
            optionId: input.optionId,
            castAt: now,
            updatedAt: now,
          });
          votes.set(existing.id, updated);
          return ok(updated);
        }
      }
      const vote: WeddingVote = Object.freeze({
        id: nextId('wedding-vote'),
        pollId: input.pollId,
        userId: input.userId,
        optionId: input.optionId,
        castAt: now,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      votes.set(vote.id, vote);
      return ok(vote);
    },

    async getVote(pollId: string, userId: string): Promise<Result<WeddingVote | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const v of votes.values()) {
        if (v.pollId === pollId && v.userId === userId) return ok(v);
      }
      return ok(null);
    },

    async listVotes(pollId: string): Promise<Result<readonly WeddingVote[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(votes.values()).filter((v) => v.pollId === pollId));
    },
  });
}
