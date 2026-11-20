import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore, useSettingsStore } from '@/stores';
import { WeddingsSection } from '../sections/WeddingsSection';

const mockNavigate = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: jest.fn(), replace: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('WeddingsSection', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
      useSettingsStore.setState({ homeSectionOrder: [], homeSectionVisibility: {}, hydrated: true });
    });
  });

  it('shows an honest empty state when no wedding is open', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <WeddingsSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-weddings-empty')).toBeTruthy();
    });
  });

  it('lists only open weddings, sorted by date', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <WeddingsSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories.weddings;
      const late = await repos.create({
        titleKey: 'home:demo.weddings.second',
        scheduledDate: '2026-09-01T16:00:00.000Z',
        capacity: 30,
      });
      const early = await repos.create({
        titleKey: 'home:demo.weddings.first',
        scheduledDate: '2026-06-15T16:00:00.000Z',
        capacity: 40,
      });
      await repos.create({
        titleKey: 'home:demo.weddings.second',
        scheduledDate: '2026-05-01T16:00:00.000Z',
        capacity: 10,
      });
      if (late.ok) await repos.update(late.value.id, { status: 'open' });
      if (early.ok) await repos.update(early.value.id, { status: 'open' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/weddings-card-/).length).toBe(2);
    });
    expect(screen.getByTestId('section-weddings-header-action')).toBeTruthy();
  });
});
