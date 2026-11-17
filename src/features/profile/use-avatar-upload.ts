// Avatar upload through the SAME FileStorageProvider used in production.
// The returned URL is kept in the Query cache (server-state layer).
// Profile has no avatar column yet, so persistence across restarts is P18.
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useSession } from '@/features/shell/use-session';
import type { AppMode } from '@/stores';
import { normalizeAvatar, pickAvatar } from './image-pipeline';

export function avatarQueryKey(mode: AppMode, userId: string | null) {
  return ['profile', 'avatar', mode, userId] as const;
}

export interface AvatarApi {
  readonly avatarUrl: string | null;
  readonly busy: boolean;
  readonly error: AppError | null;
  upload(): Promise<Result<string | null>>;
  remove(): void;
}

export function useAvatarUpload(): AvatarApi {
  const container = useProviderContainer();
  const session = useSession();
  const client = useQueryClient();
  const mode = container.mode;
  const userId = session.result?.ok ? (session.result.value?.user.id ?? null) : null;

  const query = useQuery({
    queryKey: avatarQueryKey(mode, userId),
    enabled: userId !== null,
    staleTime: Infinity,
    queryFn: () => Promise.resolve<string | null>(null),
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const upload = useCallback(async (): Promise<Result<string | null>> => {
    setBusy(true);
    setError(null);
    const picked = await pickAvatar();
    if (!picked.ok) {
      setError(picked.error);
      setBusy(false);
      return { ok: false, error: picked.error };
    }
    if (!picked.value) {
      setBusy(false);
      return { ok: true, value: null };
    }
    const normalized = await normalizeAvatar(picked.value);
    if (!normalized.ok) {
      setError(normalized.error);
      setBusy(false);
      return { ok: false, error: normalized.error };
    }
    const uploaded = await container.storage.uploadFile(normalized.value, {
      contentType: 'image/jpeg',
    });
    if (!uploaded.ok) {
      setError(uploaded.error);
      setBusy(false);
      return { ok: false, error: uploaded.error };
    }
    client.setQueryData(avatarQueryKey(mode, userId), uploaded.value.url);
    setBusy(false);
    return { ok: true, value: uploaded.value.url };
  }, [container, client, mode, userId]);

  const remove = useCallback((): void => {
    setError(null);
    client.setQueryData(avatarQueryKey(mode, userId), null);
  }, [client, mode, userId]);

  return { avatarUrl: query.data ?? null, busy, error, upload, remove };
}
