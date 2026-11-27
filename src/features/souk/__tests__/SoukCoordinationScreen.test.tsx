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
import { SoukCoordinationScreen } from '../screens/SoukCoordinationScreen';

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

async function seedAccepted(withPhone: boolean): Promise<string> {
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
  await submitItemForPublication(itemDeps, item.value.id, 'demo-user-test', DEFAULT_SOUK_LIMITS, now);
  if (withPhone) {
    await repos.profiles.create({
      userId: 'recipient-1',
      displayName: 'Recipient',
      gender: 'unspecified',
      maritalStatus: 'single',
      phone: '+967700000001',
    });
  }
  const request = await createRequest(
    requestDeps,
    item.value.id,
    'recipient-1',
    'Setting up a new home for a young family.',
    DEFAULT_SOUK_LIMITS,
    now,
  );
  if (!request.ok) throw new Error('setup failed');
  await decideRequest(requestDeps, request.value.id, 'demo-user-test', 'member', 'accepted', now);
  return request.value.id;
}

describe('SoukCoordinationScreen', () => {
  beforeEach(async () => {
    mockRequestId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(withPhone: boolean) {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukCoordinationScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockRequestId = await seedAccepted(withPhone);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukCoordinationScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-safe-meeting')).toBeTruthy();
    });
    return { client, view };
  }

  it('shows safe meeting guidance and the demo handover code', async () => {
    await setup(true);
    expect(screen.getByTestId('souk-handover-card-code')).toBeTruthy();
    expect(screen.getByTestId('souk-disclosure-reason')).toBeTruthy();
    expect(screen.queryByTestId('souk-disclosure-phone')).toBeNull();
  });

  it('sends plain text and blocks a phone number', async () => {
    const { client, view } = await setup(true);
    await fireEvent.changeText(screen.getByTestId('souk-chat-input'), 'Pickup at the public square.');
    await fireEvent.press(screen.getByTestId('souk-chat-send'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukCoordinationScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId(/^souk-message-/).length).toBeGreaterThan(0);
    });
    await fireEvent.changeText(screen.getByTestId('souk-chat-input'), 'call 771234567');
    await fireEvent.press(screen.getByTestId('souk-chat-send'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-coordination-action-error')).toBeTruthy();
    });
  });

  it('reveals the counterparty number only after both consents', async () => {
    const { client, view } = await setup(true);
    await fireEvent(screen.getByTestId('souk-disclosure-switch'), 'valueChange', true);
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukCoordinationScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.queryByTestId('souk-disclosure-phone')).toBeNull();
    });
    await act(async () => {
      await container!.repositories.soukRequests.update(mockRequestId, {
        recipientContactConsent: true,
      });
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukCoordinationScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-disclosure-phone')).toBeTruthy();
    });
  });
});
