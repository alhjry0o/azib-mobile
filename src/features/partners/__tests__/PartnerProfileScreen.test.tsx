import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { PartnerProfileScreen } from '../screens/PartnerProfileScreen';

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

describe('PartnerProfileScreen', () => {
  beforeEach(async () => {
    mockId = '';
    container = null;
    await resetShellStores();
  });

  async function setup() {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerProfileScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const created = await container!.repositories.partners.create({
        displayName: 'Demo Hall',
        category: 'halls',
        governorateId: 'sanaa',
      });
      if (created.ok) mockId = created.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerProfileScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('renders the partner and warns honestly when unverified', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByTestId('partner-summary')).toBeTruthy();
    });
    expect(screen.getByTestId('partner-not-verified')).toBeTruthy();
    expect(screen.queryByTestId('partner-profile-crown')).toBeNull();
    expect(screen.getByTestId('partner-offers-empty')).toBeTruthy();
  });

  it('shows a missing state for an unknown id', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerProfileScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = 'does-not-exist';
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerProfileScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('partner-profile-missing')).toBeTruthy();
    });
  });
});
