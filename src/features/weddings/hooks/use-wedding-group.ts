import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Wedding } from '@/repositories/contracts/wedding';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import { toMemberView, type MemberView } from '../state/roles';

export interface GroupPayload {
  readonly group: Wedding;
  readonly members: readonly MemberView[];
  readonly activeCount: number;
  readonly myRole: MemberView['role'] | null;
  readonly isMember: boolean;
}

export interface WeddingGroupApi {
  readonly data: GroupPayload | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  refetch: () => void;
}

export function useWeddingGroup(groupId: string): WeddingGroupApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const viewerId = auth.user?.id ?? null;

  const query = useQuery({
    queryKey: ['weddings', 'group', container.mode, groupId, viewerId],
    enabled: container.mode === 'demo' && groupId.length > 0,
    staleTime: 10_000,
    queryFn: async (): Promise<Result<GroupPayload | null>> => {
      const found = await container.repositories.weddings.getById(groupId);
      if (!found.ok) return found;
      if (!found.value) return { ok: true, value: null };
      const listed = await container.repositories.weddingGroups.listMembers(groupId);
      if (!listed.ok) return listed;

      const views: MemberView[] = [];
      for (const member of listed.value) {
        let name: string | null = null;
        if (member.displayNameConsent || member.userId === viewerId) {
          const profile = await container.repositories.profiles.getByUserId(member.userId);
          name = profile.ok && profile.value ? profile.value.displayName : null;
        }
        views.push(toMemberView(member, name, viewerId));
      }
      const mine = views.find((v) => v.userId === viewerId && v.status === 'active') ?? null;
      return {
        ok: true,
        value: {
          group: found.value,
          members: views,
          activeCount: views.filter((v) => v.status === 'active').length,
          myRole: mine?.role ?? null,
          isMember: mine !== null,
        },
      };
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    data: query.data?.ok ? query.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: container.mode !== 'demo',
    refetch,
  };
}
