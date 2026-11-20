import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { OffersSection } from '../sections/OffersSection';

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

describe('OffersSection', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('never shows an offer whose partner is not verified', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <OffersSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const partner = await repos.partners.create({ displayName: 'Demo Partner', category: 'venue' });
      if (!partner.ok) throw new Error('setup failed');
      const offer = await repos.offers.create({
        partnerId: partner.value.id,
        titleKey: 'home:demo.offers.venue',
        discountPercent: 15,
      });
      if (offer.ok) await repos.offers.update(offer.value.id, { status: 'active' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('section-offers-empty')).toBeTruthy();
    });
    expect(screen.queryAllByTestId(/offers-card-/).length).toBe(0);
  });

  it('shows active offers from verified partners with a discount badge', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <OffersSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const partner = await repos.partners.create({ displayName: 'Demo Partner', category: 'venue' });
      if (!partner.ok) throw new Error('setup failed');
      await repos.partners.update(partner.value.id, { status: 'verified' });
      const offer = await repos.offers.create({
        partnerId: partner.value.id,
        titleKey: 'home:demo.offers.venue',
        discountPercent: 15,
      });
      if (offer.ok) await repos.offers.update(offer.value.id, { status: 'active' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/offers-card-/).length).toBe(1);
    });
    expect(screen.getByText('Demo Partner')).toBeTruthy();
    expect(screen.getAllByTestId(/offers-discount-/).length).toBe(1);
  });
});
