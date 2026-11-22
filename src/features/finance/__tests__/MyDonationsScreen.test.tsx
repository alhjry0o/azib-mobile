import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { createDonationIntent } from '../services/donation-intent-service';
import { MyDonationsScreen } from '../screens/MyDonationsScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('MyDonationsScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  function clientWithSession() {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    return client;
  }

  it('shows an honest empty state', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <MyDonationsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('donations-empty')).toBeTruthy();
    });
  });

  it('lists an intent with an unconfirmed certainty badge', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <MyDonationsScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      const created = await createDonationIntent(
        {
          donations: container!.repositories.donations,
          payment: container!.payment,
          audit: container!.repositories.audit,
        },
        {
          donorId: 'demo-user-test',
          programId: 'p1',
          amount: 25000,
          anonymous: true,
          idempotencyKey: 'test-key-1',
        },
      );
      if (created.ok) id = created.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId(`donation-${id}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`donation-certainty-${id}`)).toBeTruthy();
  });
});
