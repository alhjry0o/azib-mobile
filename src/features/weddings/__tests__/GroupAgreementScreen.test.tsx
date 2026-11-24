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
import {
  addBudgetItem,
  adoptBudget,
  approveShare,
  createBudgetVersion,
} from '../services/budget-service';
import { createGroup } from '../services/group-service';
import { GroupAgreementScreen } from '../screens/GroupAgreementScreen';

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

describe('GroupAgreementScreen', () => {
  beforeEach(async () => {
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state before adoption', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <GroupAgreementScreen />
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
        <GroupAgreementScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('agreement-empty')).toBeTruthy();
    });
  });

  it('renders the agreement after unanimous adoption', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <GroupAgreementScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const deps = {
        budgets: repos.weddingBudgets,
        groups: repos.weddingGroups,
        weddings: repos.weddings,
        notifications: repos.notifications,
        audit: repos.audit,
      };
      const group = await createGroup(deps, {
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
      });
      if (!group.ok) throw new Error('setup failed');
      mockId = group.value.id;
      const version = await createBudgetVersion(deps, mockId, 'demo-user-test', {
        splitMode: 'equal',
      });
      if (!version.ok) throw new Error('version failed');
      await addBudgetItem(deps, mockId, version.value.id, 'demo-user-test', {
        category: 'hall',
        labelKey: 'Hall',
        amount: 60000,
        scope: 'shared',
      });
      await approveShare(deps, mockId, version.value.id, 'demo-user-test');
      await adoptBudget(deps, mockId, version.value.id, 'demo-user-test');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupAgreementScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('agreement-card')).toBeTruthy();
    });
    expect(screen.getByTestId('agreement-acknowledge')).toBeTruthy();
  });
});
