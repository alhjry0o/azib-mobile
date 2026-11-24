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
import { createPoll } from '../services/poll-service';
import { GroupPollsScreen } from '../screens/GroupPollsScreen';

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

describe('GroupPollsScreen', () => {
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
        <GroupPollsScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const groupDeps = {
        weddings: repos.weddings,
        groups: repos.weddingGroups,
        notifications: repos.notifications,
        audit: repos.audit,
      };
      const group = await createGroup(groupDeps, {
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
      await createPoll(
        {
          polls: repos.weddingPolls,
          groups: repos.weddingGroups,
          notifications: repos.notifications,
          audit: repos.audit,
        },
        mockId,
        'demo-user-test',
        {
          questionKey: 'weddings:polls.title',
          kind: 'date',
          options: [
            { id: 'o1', labelKey: 'weddings:polls.open' },
            { id: 'o2', labelKey: 'weddings:polls.closed' },
          ],
          deadline: '2099-01-01T00:00:00.000Z',
          quorumPercent: 51,
          tieBreak: 'organizer_vote',
        },
      );
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupPollsScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('shows an honest empty state before any poll exists', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <GroupPollsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('polls-empty')).toBeTruthy();
    });
  });

  it('renders live results and records a vote', async () => {
    const { client, view } = await setup();
    await waitFor(() => {
      expect(screen.getAllByTestId(/^poll-vote-/).length).toBe(2);
    });
    const buttons = screen.getAllByTestId(/^poll-vote-/);
    await fireEvent.press(buttons[0]!);
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupPollsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId(/^poll-count-/).length).toBe(2);
    });
    const polls = await container!.repositories.weddingPolls.listPolls(mockId);
    if (polls.ok) {
      const votes = await container!.repositories.weddingPolls.listVotes(polls.value[0]!.id);
      if (votes.ok) expect(votes.value.length).toBe(1);
    }
  });
});
