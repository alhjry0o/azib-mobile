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
import { SavedOffersScreen } from '../screens/SavedOffersScreen';

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

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

describe('SavedOffersScreen', () => {
  beforeEach(async () => {
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
        <SavedOffersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('saved-offers-empty')).toBeTruthy();
    });
  });

  it('lists a saved offer', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SavedOffersScreen />
      </ShellProviders>,
    );
    let offerId = '';
    await act(async () => {
      const repos = container!.repositories;
      const offer = await repos.offers.create({
        partnerId: 'p1',
        titleKey: 'marketplace:offers.title',
        discountPercent: 10,
        validUntil: '2099-01-01T00:00:00.000Z',
      });
      if (!offer.ok) throw new Error('setup failed');
      offerId = offer.value.id;
      await repos.offers.update(offerId, { status: 'active' });
      await repos.partnerEngagement.save('demo-user-test', offerId);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SavedOffersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`offer-card-${offerId}`)).toBeTruthy();
    });
  });
});
