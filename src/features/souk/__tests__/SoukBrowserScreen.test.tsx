import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore } from '@/stores';
import { createItemDraft, submitItemForPublication } from '../services/item-service';
import { DEFAULT_SOUK_LIMITS } from '../state/limits';
import { SoukBrowserScreen } from '../screens/SoukBrowserScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/components/ui/form/Select', () => ({
  Select: () => null,
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

async function seedAvailable(title: string, category: string): Promise<string> {
  const deps = {
    souk: container!.repositories.souk,
    audit: container!.repositories.audit,
  };
  const now = new Date();
  const created = await createItemDraft(
    deps,
    {
      donorId: 'donor-1',
      title,
      category,
      condition: 'good',
      description: 'A gently used item offered as an in-kind donation.',
      governorateId: 'sanaa',
      districtId: null,
      deliveryMethod: 'self_pickup',
      imageFileIds: [],
      imageFingerprints: [],
      estimatedValue: 10000,
      noResaleConsent: true,
    },
    DEFAULT_SOUK_LIMITS,
    now,
  );
  if (!created.ok) throw new Error('setup failed');
  await submitItemForPublication(deps, created.value.id, 'donor-1', DEFAULT_SOUK_LIMITS, now);
  return created.value.id;
}

describe('SoukBrowserScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
  });

  it('shows the no-price note and the gift empty state', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('souk-no-price-note')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('souk-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('souk-empty-gift')).toBeTruthy();
  });

  it('lists an available item without exposing donor or estimate', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedAvailable('Bedroom set', 'furniture');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`souk-card-${id}`)).toBeTruthy();
    });
    expect(screen.queryByText('donor-1')).toBeNull();
    expect(screen.queryByText('10000')).toBeNull();
    await fireEvent.press(screen.getByTestId(`souk-open-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/souk/${id}`);
  });

  it('filters by category and clears the filters', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await seedAvailable('Bedroom set', 'furniture');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-category-books')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('souk-category-books'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('souk-clear-filters'));
    await waitFor(() => {
      expect(screen.queryByTestId('souk-empty')).toBeNull();
    });
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <SoukBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('souk-search')).toBeNull();
    expect(screen.getByTestId('souk-screen')).toBeTruthy();
  });
});
