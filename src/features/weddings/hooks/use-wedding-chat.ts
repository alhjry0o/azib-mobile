import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { ChatMessage, ChatMute } from '@/repositories/contracts/wedding-chat';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import type { AppMode } from '@/stores';
import { filterRetained } from '../chat/retention';
import {
  muteChatMember,
  purgeExpiredChat,
  removeChatMessage,
  reportChatMessage,
  sendChatMessage,
  unmuteChatMember,
} from '../services/chat-service';

export function chatQueryKey(mode: AppMode, groupId: string) {
  return ['weddings', 'chat', mode, groupId] as const;
}

export interface WeddingChatApi {
  readonly messages: readonly ChatMessage[];
  readonly mutes: readonly ChatMute[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  send(text: string): Promise<Result<ChatMessage>>;
  report(messageId: string): Promise<Result<ChatMessage>>;
  remove(messageId: string): Promise<Result<ChatMessage>>;
  mute(targetUserId: string): Promise<Result<ChatMute>>;
  unmute(targetUserId: string): Promise<Result<void>>;
}

export function useWeddingChat(groupId: string): WeddingChatApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const userId = auth.user?.id ?? null;
  const mode = container.mode;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      chat: container.repositories.weddingChat,
      groups: container.repositories.weddingGroups,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: chatQueryKey(mode, groupId),
    enabled: mode === 'demo' && groupId.length > 0,
    staleTime: 2_000,
    queryFn: async (): Promise<Result<readonly ChatMessage[]>> => {
      const now = new Date();
      await purgeExpiredChat(deps, groupId, now);
      const listed = await deps.chat.listMessages(groupId);
      if (!listed.ok) return listed;
      return { ok: true, value: filterRetained(listed.value, now) };
    },
  });

  // Local realtime bus writes into the Query cache (an external store),
  // so no React setState happens inside the effect.
  useEffect(() => {
    if (mode !== 'demo' || groupId.length === 0) return;
    const unsubscribe = deps.chat.subscribe(groupId, (messages) => {
      client.setQueryData(chatQueryKey(mode, groupId), { ok: true, value: messages });
    });
    return unsubscribe;
  }, [deps, client, mode, groupId]);

  const mutesQuery = useQuery({
    queryKey: ['weddings', 'chat-mutes', mode, groupId],
    enabled: mode === 'demo' && groupId.length > 0,
    staleTime: 5_000,
    queryFn: () => deps.chat.listMutes(groupId),
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

  const send = useCallback(
    (text: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return sendChatMessage(deps, groupId, userId, text, new Date());
      }),
    [run, userId, deps, groupId],
  );

  const report = useCallback(
    (messageId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return reportChatMessage(deps, groupId, messageId, userId);
      }),
    [run, userId, deps, groupId],
  );

  const remove = useCallback(
    (messageId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return removeChatMessage(deps, groupId, messageId, userId);
      }),
    [run, userId, deps, groupId],
  );

  const mute = useCallback(
    (targetUserId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return muteChatMember(deps, groupId, targetUserId, userId, null);
      }),
    [run, userId, deps, groupId],
  );

  const unmute = useCallback(
    (targetUserId: string) =>
      run(async () => {
        if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
        return unmuteChatMember(deps, groupId, targetUserId, userId);
      }),
    [run, userId, deps, groupId],
  );

  return {
    messages: query.data?.ok ? query.data.value : [],
    mutes: mutesQuery.data?.ok ? mutesQuery.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    busy,
    actionError,
    send,
    report,
    remove,
    mute,
    unmute,
  };
}
