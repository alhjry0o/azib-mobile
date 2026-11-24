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
import { useAuthStore } from '@/stores';
import { createGroup } from '../services/group-service';
import { GroupBudgetScreen } from '../screens/GroupBudgetScreen';

let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
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

describe('GroupBudgetScreen', () => {
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
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <GroupBudgetScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const group = await createGroup(
        {
          weddings: repos.weddings,
          groups: repos.weddingGroups,
          notifications: repos.notifications,
          audit: repos.audit,
        },
        {
          organizerId: 'demo-user-test',
          title: 'Demo group',
          governorateId: 'sanaa',
          districtId: null,
          city: null,
          scheduledDate: '2026-06-15T16:00:00.000Z',
          alternateDate: null,
          targetCount: 6,
          description: null,
          maxGroupSize: 12,
        },
      );
      if (group.ok) mockId = group.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupBudgetScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('shows an honest empty state before any version exists', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByTestId('budget-empty')).toBeTruthy();
    });
  });

  it('creates a version, adds an item and renders the split report', async () => {
    const { client, view } = await setup();
    await waitFor(() => {
      expect(screen.getByTestId('budget-create-version')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('budget-create-version'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupBudgetScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('budget-item-label')).toBeTruthy();
    });
    await fireEvent.changeText(screen.getByTestId('budget-item-label'), 'Hall');
    await fireEvent.changeText(screen.getByTestId('budget-item-amount'), '90000');
    await fireEvent.press(screen.getByTestId('budget-add-item'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupBudgetScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('budget-report')).toBeTruthy();
    });
    expect(screen.getByTestId('cost-split-bars')).toBeTruthy();
  });

  it('keeps adoption disabled until everyone approves', async () => {
    const { client, view } = await setup();
    await waitFor(() => {
      expect(screen.getByTestId('budget-create-version')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('budget-create-version'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupBudgetScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('budget-adopt')).toBeTruthy();
    });
    expect(screen.getByTestId('budget-adopt').props.accessibilityState.disabled).toBe(true);
  });
});
