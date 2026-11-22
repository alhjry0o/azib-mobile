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
import {
  createDonationIntent,
  handoffToProvider,
  simulateProviderOutcome,
  verifyDonation,
} from '../services/donation-intent-service';
import { ReceiptsScreen } from '../screens/ReceiptsScreen';

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

describe('ReceiptsScreen', () => {
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

  it('issues no receipt for an unverified intent', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <ReceiptsScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await createDonationIntent(
        {
          donations: container!.repositories.donations,
          payment: container!.payment,
          audit: container!.repositories.audit,
        },
        {
          donorId: 'demo-user-test',
          programId: 'p1',
          amount: 10000,
          anonymous: false,
          idempotencyKey: 'receipt-key-1',
        },
      );
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId('receipts-empty')).toBeTruthy();
    });
  });

  it('issues a receipt only after financial verification', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <ReceiptsScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const deps = {
        donations: container!.repositories.donations,
        payment: container!.payment,
        audit: container!.repositories.audit,
      };
      const created = await createDonationIntent(deps, {
        donorId: 'demo-user-test',
        programId: 'p1',
        amount: 10000,
        anonymous: false,
        idempotencyKey: 'receipt-key-2',
      });
      if (!created.ok) throw new Error('setup failed');
      await handoffToProvider(deps, created.value.id);
      await simulateProviderOutcome(deps, created.value.id, 'confirm');
      await verifyDonation(deps, created.value.id, 'finance-1');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/^receipt-/).length).toBe(1);
    });
  });
});
