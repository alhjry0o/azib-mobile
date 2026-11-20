import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore, useSettingsStore } from '@/stores';
import { CommunityStatsSection } from '../sections/CommunityStatsSection';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('CommunityStatsSection', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
      useSettingsStore.setState({ numberSystem: 'latn', hydrated: true });
    });
  });

  it('shows an honest empty state with no records', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <CommunityStatsSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-community-stats-empty')).toBeTruthy();
    });
  });

  it('renders only the demo bucket and suppresses small numbers', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <CommunityStatsSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      await repos.donations.create({ donorId: 'donor-1', amount: 100000 });
      await repos.disbursements.create({ applicationId: 'app-1', amount: 50000 });
      await repos.profiles.create({
        userId: 'user-1',
        displayName: 'Demo Person',
        gender: 'unspecified',
        maritalStatus: 'single',
      });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('stats-demo-bucket')).toBeTruthy();
    });
    expect(screen.getByTestId('stats-demo-badge')).toBeTruthy();
    expect(screen.getByTestId('stats-threshold-note')).toBeTruthy();
    expect(screen.getByTestId('stats-donations')).toBeTruthy();
    expect(screen.getByTestId('stats-beneficiaries')).toBeTruthy();
    expect(screen.queryByTestId('stats-real', { includeHiddenElements: true })).toBeNull();
  });
});
