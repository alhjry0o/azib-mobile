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
import { createGroup } from '../services/group-service';
import { WeddingDiscoveryScreen } from '../screens/WeddingDiscoveryScreen';

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

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

async function seedGroup(governorateId: string): Promise<string> {
  const repos = container!.repositories;
  const created = await createGroup(
    {
      weddings: repos.weddings,
      groups: repos.weddingGroups,
      notifications: repos.notifications,
      audit: repos.audit,
    },
    {
      organizerId: 'demo-user-test',
      title: 'Demo group',
      governorateId,
      districtId: null,
      city: null,
      scheduledDate: '2026-06-15T16:00:00.000Z',
      alternateDate: null,
      targetCount: 6,
      description: null,
      maxGroupSize: 12,
    },
  );
  if (!created.ok) throw new Error('setup failed');
  return created.value.id;
}

describe('WeddingDiscoveryScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state and the public-privacy note', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('weddings-public-note')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('weddings-empty')).toBeTruthy();
    });
  });

  it('lists a created group without exposing member names', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedGroup('sanaa');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`wedding-card-${id}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`wedding-month-${id}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`wedding-open-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/weddings/${id}`);
  });

  it('filters by size and clears the filters', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await seedGroup('sanaa');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('filter-size')).toBeTruthy();
    });
    const tabs = screen.getAllByRole('tab');
    await fireEvent.press(tabs[tabs.length - 1]!);
    await waitFor(() => {
      expect(screen.getByTestId('weddings-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('filter-clear'));
    await waitFor(() => {
      expect(screen.queryByTestId('weddings-empty')).toBeNull();
    });
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <WeddingDiscoveryScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('weddings-create')).toBeNull();
    expect(screen.getByTestId('weddings-screen')).toBeTruthy();
  });
});
