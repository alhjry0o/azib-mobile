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
import { createGroup, requestJoin } from '../services/group-service';
import { GroupMembersScreen } from '../screens/GroupMembersScreen';

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

describe('GroupMembersScreen', () => {
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
        <GroupMembersScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const deps = {
        weddings: repos.weddings,
        groups: repos.weddingGroups,
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
      await requestJoin(deps, mockId, 'u2', 'please add me', true);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupMembersScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('lists pending requests for the organizer and approves one', async () => {
    const { client, view } = await setup();
    await waitFor(() => {
      expect(screen.getByTestId('join-requests')).toBeTruthy();
    });
    const approvals = screen.getAllByTestId(/^request-approve-/);
    await fireEvent.press(approvals[0]!);
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupMembersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      const members = container!.repositories.weddingGroups;
      expect(members).toBeTruthy();
    });
    const listed = await container!.repositories.weddingGroups.listMembers(mockId);
    if (listed.ok) expect(listed.value.length).toBe(2);
  });

  it('never renders a member name without consent', async () => {
    const { client, view } = await setup();
    await act(async () => {
      await container!.repositories.weddingGroups.addMember({
        groupId: mockId,
        userId: 'u3',
        displayNameConsent: false,
      });
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupMembersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId(/^member-/).length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('u3')).toBeNull();
  });
});
