import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukChatMessage } from '@/repositories/contracts/souk-chat';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import type { AppMode } from '@/stores';
import {
  readCounterpartyContact,
  reportMessage,
  sendCoordinationMessage,
  setContactConsent,
  type DisclosureView,
} from '../services/coordination-service';
import { toPartyRequestView, type PartyRequestView } from '../state/public-view';
import { toRequestWorkflowStatus } from '../state/request-machine';

export function soukChatQueryKey(mode: AppMode, requestId: string) {
  return ['souk', 'chat', mode, requestId] as const;
}

export interface CoordinationPayload {
  readonly request: PartyRequestView;
  readonly itemTitle: string;
  readonly isDonor: boolean;
  readonly accepted: boolean;
}

export interface SoukCoordinationApi {
  readonly data: CoordinationPayload | null;
  readonly messages: readonly SoukChatMessage[];
  readonly disclosure: DisclosureView | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly notConnected: boolean;
  readonly busy: boolean;
  readonly actionError: AppError | null;
  send(text: string): Promise<Result<SoukChatMessage>>;
  setConsent(consent: boolean): Promise<Result<unknown>>;
  report(messageId: string): Promise<Result<SoukChatMessage>>;
  refetch: () => void;
}

export function useSoukCoordination(requestId: string): SoukCoordinationApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const client = useQueryClient();
  const mode = container.mode;
  const userId = auth.user?.id ?? null;
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const deps = useMemo(
    () => ({
      souk: container.repositories.souk,
      requests: container.repositories.soukRequests,
      chat: container.repositories.soukChat,
      profiles: container.repositories.profiles,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const query = useQuery({
    queryKey: ['souk', 'coordination', mode, requestId, userId],
    enabled: mode === 'demo' && requestId.length > 0 && userId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<CoordinationPayload | null>> => {
      const found = await container.repositories.soukRequests.getById(requestId);
      if (!found.ok) return found;
      const request = found.value;
      if (!request) return { ok: true, value: null };
      const item = await container.repositories.souk.getById(request.itemId);
      if (!item.ok) return item;
      if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
      const view = toPartyRequestView(request);
      const isDonor = item.value.donorId === userId;
      return {
        ok: true,
        value: {
          request: isDonor ? view : { ...view, handoverCode: null },
          itemTitle: item.value.title ?? item.value.titleKey,
          isDonor,
          accepted: toRequestWorkflowStatus(request.status) === 'accepted',
        },
      };
    },
  });

  const chatQuery = useQuery({
    queryKey: soukChatQueryKey(mode, requestId),
    enabled: mode === 'demo' && requestId.length > 0,
    staleTime: 2_000,
    queryFn: () => container.repositories.soukChat.listMessages(requestId),
  });

  // Local realtime bus writes into the Query cache (an external store),
  // so no React setState happens inside the effect.
  useEffect(() => {
    if (mode !== 'demo' || requestId.length === 0) return;
    const unsubscribe = container.repositories.soukChat.subscribe(requestId, (messages) => {
      client.setQueryData(soukChatQueryKey(mode, requestId), { ok: true, value: messages });
    });
    return unsubscribe;
  }, [container, client, mode, requestId]);

  const disclosureQuery = useQuery({
    queryKey: ['souk', 'disclosure', mode, requestId, userId],
    enabled: mode === 'demo' && requestId.length > 0 && userId !== null,
    staleTime: 2_000,
    queryFn: () => readCounterpartyContact(deps, requestId, userId ?? ''),
  });

  const run = useCallback(
    async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
      setBusy(true);
      setActionError(null);
      if (!userId) {
        const failure = AppError.auth({ code: 'NO_SESSION' });
        setActionError(failure);
        setBusy(false);
        return { ok: false, error: failure };
      }
      const result = await fn();
      if (result.ok) await client.invalidateQueries({ queryKey: ['souk'] });
      else setActionError(result.error);
      setBusy(false);
      return result;
    },
    [userId, client],
  );

  const send = useCallback(
    (text: string) =>
      run(() => sendCoordinationMessage(deps, requestId, userId ?? '', text, new Date())),
    [run, deps, requestId, userId],
  );

  const setConsent = useCallback(
    (consent: boolean) => run(() => setContactConsent(deps, requestId, userId ?? '', consent)),
    [run, deps, requestId, userId],
  );

  const report = useCallback(
    (messageId: string) => run(() => reportMessage(deps, requestId, messageId, userId ?? '')),
    [run, deps, requestId, userId],
  );

  const refetch = useCallback(() => {
    void query.refetch();
    void disclosureQuery.refetch();
  }, [query, disclosureQuery]);

  return {
    data: query.data?.ok ? query.data.value : null,
    messages: chatQuery.data?.ok ? chatQuery.data.value : [],
    disclosure: disclosureQuery.data?.ok ? disclosureQuery.data.value : null,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    notConnected: mode !== 'demo',
    busy,
    actionError,
    send,
    setConsent,
    report,
    refetch,
  };
}
