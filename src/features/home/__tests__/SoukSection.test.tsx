import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { SoukSection } from '../sections/SoukSection';

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

describe('SoukSection', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state with no items', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <SoukSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-souk-empty')).toBeTruthy();
    });
  });

  it('lists available items and hides claimed ones', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repo = container!.repositories.souk;
      const available = await repo.create({
        titleKey: 'home:demo.souk.furniture',
        category: 'furniture',
      });
      const claimed = await repo.create({
        titleKey: 'home:demo.souk.kitchen',
        category: 'kitchenware',
      });
      if (available.ok) await repo.update(available.value.id, { status: 'available' });
      if (claimed.ok) await repo.update(claimed.value.id, { status: 'claimed' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/souk-item-/).length).toBe(1);
    });
  });
});
