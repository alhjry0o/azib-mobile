import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { CreatePollInput, WeddingPoll, WeddingVote } from '@/repositories/contracts/wedding-poll';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { castVote, closePoll, createPoll } from '../services/poll-service';
import { tallyPoll, type PollTally } from '../state/poll-rules';

export interface PollRow {
  readonly poll: WeddingPoll;
  readonly tally: PollTally;
  readonly myOptionId: string | null;
}

export interface PollsPayload {
  readonly rows: readonly PollRow[];
  /** Captured inside queryFn so render never reads the clock. */
  readonly evaluatedAt: string;
}

export interface WeddingPollsApi {
  readonly rows: readonly PollRow[];
  readonly evaluatedAt: string | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  vote(pollId: string, optionId: string): Promise<Result<WeddingVote>>;
  create(input: Omit<CreatePollInput, 'groupId' | 'createdById'>): Promise<Result<WeddingPoll>>;
  close(pollId: string): Promise<Result<WeddingPoll>>;
  refetch(): void;
}

export function useWeddingPolls(groupId: string, memberCount: number): WeddingPollsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      polls: container.repositories.weddingPolls,
      groups: container.repositories.weddingGroups,
      notifications: container.repositories.notifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['weddings', 'polls', container.mode, groupId, userId, memberCount],
    enabled: container.mode === 'demo' && groupId.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<PollsPayload>> => {
      const listed = await deps.polls.listPolls(groupId);
      if (!listed.ok) return listed;
      const now = new Date();
      const rows: PollRow[] = [];
      for (const poll of listed.value) {
        const votes = await deps.polls.listVotes(poll.id);
        const voteRows = votes.ok ? votes.value : [];
        const mine = voteRows.find((v) => v.userId === userId) ?? null;
        const organizerVote = voteRows.find((v) => v.userId === poll.createdById) ?? null;
        rows.push({
          poll,
          myOptionId: mine?.optionId ?? null,
          tally: tallyPoll({
            options: poll.options,
            votes: voteRows.map((v) => ({ userId: v.userId, optionId: v.optionId })),
            eligibleCount: memberCount,
            quorumPercent: poll.quorumPercent,
            deadline: poll.deadline,
            now,
            tieBreak: poll.tieBreak,
            organizerOptionId: organizerVote?.optionId ?? null,
          }),
        });
      }
      return { ok: true, value: { rows, evaluatedAt: now.toISOString() } };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setActionError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['weddings'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const vote = useCallback(
    (pollId: string, optionId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return castVote(deps, pollId, userId, optionId, new Date());
      }),
    [run, userId, deps],
  );

  const create = useCallback(
    (input: Omit<CreatePollInput, 'groupId' | 'createdById'>) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return createPoll(deps, groupId, userId, input);
      }),
    [run, userId, deps, groupId],
  );

  const close = useCallback(
    (pollId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return closePoll(deps, pollId, userId);
      }),
    [run, userId, deps],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    rows: query.data?.ok ? query.data.value.rows : [],
    evaluatedAt: query.data?.ok ? query.data.value.evaluatedAt : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    busy,
    actionError,
    vote,
    create,
    close,
    refetch,
  };
}
