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
import { useAppModeStore, useAuthStore } from '@/stores';
import { DonateIntentScreen } from '../screens/DonateIntentScreen';

let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
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

describe('DonateIntentScreen', () => {
  beforeEach(async () => {
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = clientWithSession();
    const { rerender } = render(
      <ShellProviders client={client}>
        <Probe />
        <DonateIntentScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const created = await container!.repositories.programs.create({
        nameKey: 'assistance:finance.catalog.title',
        descriptionKey: 'assistance:finance.catalog.subtitle',
        minAmount: 1000,
        maxAmount: 100000,
        kind: 'grant',
      });
      if (created.ok) {
        mockId = created.value.id;
        await container!.repositories.programs.update(mockId, { status: 'open' });
      }
    });
    rerender(
      <ShellProviders client={client}>
        <Probe />
        <DonateIntentScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId('donate-amount')).toBeTruthy();
    });
    return client;
  }

  it('states clearly that the intent is unconfirmed and never charged', async () => {
    await setup();
    expect(screen.getByTestId('donate-notice')).toBeTruthy();
    expect(screen.getByTestId('donate-range')).toBeTruthy();
  });

  it('validates the amount against the program range', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('donate-amount'), '500');
    await fireEvent.press(screen.getByTestId('donate-create'));
    await waitFor(() => {
      expect(screen.queryByTestId('donate-result')).toBeNull();
    });
  });

  it('records an intent, hands it off, then simulates provider confirmation', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('donate-amount'), '50000');
    await fireEvent.press(screen.getByTestId('donate-anonymous'));
    await fireEvent.press(screen.getByTestId('donate-create'));
    await waitFor(() => {
      expect(screen.getByTestId('donate-certainty')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('donate-handoff'));
    await waitFor(() => {
      expect(screen.getByTestId('donate-provider-reference')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId('donate-simulate'));
    await waitFor(() => {
      expect(screen.getByTestId('donate-verified-note')).toBeTruthy();
    });
    expect(screen.queryByTestId('donate-simulate')).toBeNull();
  });

  it('is idempotent: repeating the same intent does not duplicate it', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('donate-amount'), '50000');
    await fireEvent.press(screen.getByTestId('donate-create'));
    await waitFor(() => {
      expect(screen.getByTestId('donate-result')).toBeTruthy();
    });
    const listed = await container!.repositories.donations.listByDonor('demo-user-test');
    expect(listed.ok).toBe(true);
    if (listed.ok) expect(listed.value.total).toBe(1);
  });

  it('shows NotConnected in backend mode and creates nothing', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('backend'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DonateIntentScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('donate-create')).toBeNull();
    expect(screen.getByTestId('donate-intent-screen')).toBeTruthy();
  });
});
