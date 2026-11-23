import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  GroupInvitation,
  GroupRole,
  JoinRequest,
} from '@/repositories/contracts/wedding-group';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import {
  changeMemberRole,
  decideJoin,
  inviteMember,
  requestJoin,
  respondInvite,
  transitionGroup,
  withdrawMember,
} from '../services/group-service';
import type { GroupStatus } from '../state/group-machine';

export interface MembershipApi {
  readonly requests: readonly JoinRequest[];
  readonly invitations: readonly GroupInvitation[];
  readonly busy: boolean;
  readonly error: AppError | null;
  join(message: string, consent: boolean): Promise<Result<JoinRequest>>;
  decide(
    requestId: string,
    decision: 'approved' | 'rejected',
    reasonKey?: string,
  ): Promise<Result<JoinRequest>>;
  invite(inviteeId: string): Promise<Result<GroupInvitation>>;
  respond(
    invitationId: string,
    accept: boolean,
    consent: boolean,
  ): Promise<Result<GroupInvitation>>;
  setRole(memberId: string, role: GroupRole): Promise<Result<unknown>>;
  withdraw(scheduledDate: string): Promise<Result<unknown>>;
  transition(to: GroupStatus, reasonKey?: string): Promise<Result<unknown>>;
  clearError(): void;
}

export function useWeddingMembership(groupId: string): MembershipApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      weddings: container.repositories.weddings,
      groups: container.repositories.weddingGroups,
      notifications: container.repositories.notifications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const lists = useQuery({
    queryKey: ['weddings', 'membership', container.mode, groupId],
    enabled: container.mode === 'demo' && groupId.length > 0,
    staleTime: 10_000,
    queryFn: async () => {
      const requests = await deps.groups.listJoinRequests(groupId);
      const invitations = await deps.groups.listInvitations(groupId);
      return {
        requests: requests.ok ? requests.value : [],
        invitations: invitations.ok ? invitations.value : [],
      };
    },
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setError(null);
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['weddings'] });
      else setError(result.error);
      setBusy(false);
      return result;
    },
    [client],
  );

  const requireUser = useCallback((): string | null => userId, [userId]);

  const join = useCallback(
    (message: string, consent: boolean) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return requestJoin(deps, groupId, id, message, consent);
      }),
    [run, requireUser, deps, groupId],
  );

  const decide = useCallback(
    (requestId: string, decision: 'approved' | 'rejected', reasonKey?: string) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return decideJoin(deps, groupId, requestId, id, decision, reasonKey);
      }),
    [run, requireUser, deps, groupId],
  );

  const invite = useCallback(
    (inviteeId: string) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return inviteMember(deps, groupId, id, inviteeId);
      }),
    [run, requireUser, deps, groupId],
  );

  const respond = useCallback(
    (invitationId: string, accept: boolean, consent: boolean) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return respondInvite(deps, groupId, invitationId, id, accept, consent);
      }),
    [run, requireUser, deps, groupId],
  );

  const setRole = useCallback(
    (memberId: string, role: GroupRole) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return changeMemberRole(deps, groupId, memberId, id, role);
      }),
    [run, requireUser, deps, groupId],
  );

  const withdraw = useCallback(
    (scheduledDate: string) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return withdrawMember(deps, groupId, id, scheduledDate, new Date());
      }),
    [run, requireUser, deps, groupId],
  );

  const transition = useCallback(
    (to: GroupStatus, reasonKey?: string) =>
      run(async () => {
        const id = requireUser();
        if (!id) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return transitionGroup(deps, groupId, id, to, { reasonKey });
      }),
    [run, requireUser, deps, groupId],
  );

  return {
    requests: lists.data?.requests ?? [],
    invitations: lists.data?.invitations ?? [],
    busy,
    error,
    join,
    decide,
    invite,
    respond,
    setRole,
    withdraw,
    transition,
    clearError: () => setError(null),
  };
}
