import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { createItemDraft, submitItemForPublication } from '../services/item-service';
import { createRequest } from '../services/request-service';
import { DEFAULT_SOUK_LIMITS } from '../state/limits';
import { SoukInboxScreen } from '../screens/SoukInboxScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

const draft = {
  donorId: 'demo-user-test',
  title: 'Bedroom set',
  category: 'furniture',
  condition: 'good' as const,
  description: 'A gently used bedroom set offered as an in-kind donation.',
  governorateId: 'sanaa',
  districtId: null,
  deliveryMethod: 'self_pickup' as const,
  imageFileIds: [],
  imageFingerprints: [],
  estimatedValue: null,
  noResaleConsent: true,
};

describe('SoukInboxScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <SoukInboxScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-inbox-empty')).toBeTruthy();
    });
  });

  it('accepts a pending request and opens coordination', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukInboxScreen />
      </ShellProviders>,
    );
    let requestId = '';
    await act(async () => {
      const repos = container!.repositories;
      const itemDeps = { souk: repos.souk, audit: repos.audit };
      const now = new Date();
      const item = await createItemDraft(itemDeps, draft, DEFAULT_SOUK_LIMITS, now);
      if (!item.ok) throw new Error('setup failed');
      await submitItemForPublication(itemDeps, item.value.id, 'demo-user-test', DEFAULT_SOUK_LIMITS, now);
      const request = await createRequest(
        { souk: repos.souk, requests: repos.soukRequests, audit: repos.audit },
        item.value.id,
        'recipient-1',
        'Setting up a new home for a young family.',
        DEFAULT_SOUK_LIMITS,
        now,
      );
      if (request.ok) requestId = request.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukInboxScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`souk-inbox-accept-${requestId}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`souk-inbox-accept-${requestId}`));
    await waitFor(() => {
      expect(screen.getByTestId(`souk-inbox-coordinate-${requestId}`)).toBeTruthy();
    });
    const found = await container!.repositories.soukRequests.getById(requestId);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('accepted');
      expect(found.value.handoverCode?.startsWith('AZIB-DEMO-HO-')).toBe(true);
    }
    await fireEvent.press(screen.getByTestId(`souk-inbox-coordinate-${requestId}`));
    expect(mockPush).toHaveBeenCalledWith(`/souk/coordination/${requestId}`);
  });
});
