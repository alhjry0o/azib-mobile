// Profile read/write through ProfileRepository (no contract changes).
// Profile.city stores the deepest selected location id; the cascade is
// derived from the location tree (see locations.ts).
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Profile, UpdateProfileInput } from '@/repositories/contracts/profile';
import { useProviderContainer } from '@/providers';
import { useSession } from '@/features/shell/use-session';
import type { AppMode } from '@/stores';

export function profileQueryKey(mode: AppMode, userId: string | null) {
  return ['profile', mode, userId] as const;
}

export interface ProfileApi {
  readonly profile: Profile | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  refetch(): void;
  createDefault(): Promise<Result<Profile>>;
  save(input: UpdateProfileInput): Promise<Result<Profile>>;
}

export function useProfile(): ProfileApi {
  const container = useProviderContainer();
  const session = useSession();
  const client = useQueryClient();
  const mode = container.mode;
  const user = session.result?.ok ? (session.result.value?.user ?? null) : null;
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: profileQueryKey(mode, userId),
    enabled: userId !== null,
    staleTime: 30_000,
    queryFn: async (): Promise<Result<Profile | null>> => {
      if (!userId) return { ok: true, value: null };
      return container.repositories.profiles.getByUserId(userId);
    },
  });

  const [busy, setBusy] = useState(false);
  const result = query.data;
  const profile = result?.ok ? result.value : null;
  const error = result && !result.ok ? result.error : null;

  const write = useCallback(
    (value: Profile): void => {
      client.setQueryData(profileQueryKey(mode, userId), { ok: true, value });
    },
    [client, mode, userId],
  );

  const createDefault = useCallback(async (): Promise<Result<Profile>> => {
    if (!user) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
    setBusy(true);
    const created = await container.repositories.profiles.create({
      userId: user.id,
      displayName: user.displayName,
      gender: 'unspecified',
      maritalStatus: 'single',
    });
    if (created.ok) write(created.value);
    setBusy(false);
    return created;
  }, [container, user, write]);

  const save = useCallback(
    async (input: UpdateProfileInput): Promise<Result<Profile>> => {
      if (!user) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
      setBusy(true);
      const saved = profile
        ? await container.repositories.profiles.update(profile.id, input)
        : await container.repositories.profiles.create({
            userId: user.id,
            displayName: input.displayName ?? user.displayName,
            gender: input.gender ?? 'unspecified',
            maritalStatus: input.maritalStatus ?? 'single',
            city: input.city ?? null,
          });
      if (saved.ok) write(saved.value);
      setBusy(false);
      return saved;
    },
    [container, user, profile, write],
  );

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return { profile, isLoading: query.isLoading, error, busy, refetch, createDefault, save };
}
