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
import { createRequest, decideRequest } from '../services/request-service';
import { DEFAULT_SOUK_LIMITS } from '../state/limits';
import { SoukHandoverScreen } from '../screens/SoukHandoverScreen';

let mockRequestId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ requestId: mockRequestId }),
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

describe('SoukHandoverScreen', () => {
  beforeEach(async () => {
    mockRequestId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukHandoverScreen />
      </ShellProviders>,
    );
    let itemId = '';
    await act(async () => {
      const repos = container!.repositories;
      const itemDeps = { souk: repos.souk, audit: repos.audit };
      const requestDeps = { souk: repos.souk, requests: repos.soukRequests, audit: repos.audit };
      const now = new Date();
      const item = await createItemDraft(
        itemDeps,
        {
          donorId: 'demo-user-test',
          title: 'Bedroom set',
          category: 'furniture',
          condition: 'good',
          description: 'A gently used bedroom set offered as an in-kind donation.',
          governorateId: 'sanaa',
          districtId: null,
          deliveryMethod: 'self_pickup',
          imageFileIds: [],
          imageFingerprints: [],
          estimatedValue: null,
          noResaleConsent: true,
        },
        DEFAULT_SOUK_LIMITS,
        now,
      );
      if (!item.ok) throw new Error('setup failed');
      itemId = item.value.id;
      await submitItemForPublication(itemDeps, itemId, 'demo-user-test', DEFAULT_SOUK_LIMITS, now);
      const request = await createRequest(
        requestDeps,
        itemId,
        'recipient-1',
        'Setting up a new home for a young family.',
        DEFAULT_SOUK_LIMITS,
        now,
      );
      if (!request.ok) throw new Error('setup failed');
      mockRequestId = request.value.id;
      await decideRequest(requestDeps, mockRequestId, 'demo-user-test', 'member', 'accepted', now);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukHandoverScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-handover-form')).toBeTruthy();
    });
    return { client, view, itemId };
  }

  it('rejects a wrong code and keeps the request accepted', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('souk-handover-code'), 'WRONG-CODE');
    await fireEvent.press(screen.getByTestId('souk-handover-confirm'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-handover-action-error')).toBeTruthy();
    });
    const found = await container!.repositories.soukRequests.getById(mockRequestId);
    if (found.ok && found.value) expect(found.value.status).toBe('accepted');
  });

  it('needs both confirmations, then offers a private rating', async () => {
    const { client, view, itemId } = await setup();
    const stored = await container!.repositories.soukRequests.getById(mockRequestId);
    if (!stored.ok || !stored.value) throw new Error('setup failed');
    const code = stored.value.handoverCode ?? '';

    await fireEvent.changeText(screen.getByTestId('souk-handover-code'), code);
    await fireEvent.press(screen.getByTestId('souk-handover-confirm'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukHandoverScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-handover-form')).toBeTruthy();
    });

    await act(async () => {
      await container!.repositories.soukRequests.update(mockRequestId, {
        recipientConfirmedAt: new Date().toISOString(),
      });
    });
    await fireEvent.changeText(screen.getByTestId('souk-handover-code'), code);
    await fireEvent.press(screen.getByTestId('souk-handover-confirm'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukHandoverScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-handover-done')).toBeTruthy();
    });
    const item = await container!.repositories.souk.getById(itemId);
    if (item.ok && item.value) expect(item.value.status).toBe('handed_over');

    expect(screen.getByTestId('souk-rating-form')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('souk-rating-note'), 'Smooth handover.');
    await fireEvent.press(screen.getByTestId('souk-rating-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-rating-received')).toBeTruthy();
    });
    const rated = await container!.repositories.soukRequests.getById(mockRequestId);
    if (rated.ok && rated.value) expect(rated.value.rating).toBe(5);
  });
});
