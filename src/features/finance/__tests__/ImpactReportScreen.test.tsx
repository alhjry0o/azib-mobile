import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore } from '@/stores';
import { createDonationIntent } from '../services/donation-intent-service';
import { ImpactReportScreen } from '../screens/ImpactReportScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('ImpactReportScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
  });

  it('states that demo data never counts', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ImpactReportScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('impact-real-only')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('impact-empty')).toBeTruthy();
    });
  });

  it('stays empty even after demo donations exist', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <ImpactReportScreen />
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
          donorId: 'donor-1',
          programId: 'p1',
          amount: 100000,
          anonymous: false,
          idempotencyKey: 'impact-key-1',
        },
      );
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <ImpactReportScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('impact-empty')).toBeTruthy();
    });
    expect(screen.queryByTestId('impact-metric-verifiedDonations')).toBeNull();
  });

  it('shows the provisional threshold note', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ImpactReportScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('impact-threshold')).toBeTruthy();
    });
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ImpactReportScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('impact-empty')).toBeNull();
    expect(screen.getByTestId('impact-report-screen')).toBeTruthy();
  });
});
