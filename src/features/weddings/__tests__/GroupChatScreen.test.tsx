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
import { GroupChatScreen } from '../screens/GroupChatScreen';

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

describe('GroupChatScreen', () => {
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
        <GroupChatScreen />
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
        <GroupChatScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('shows the rules and an honest empty state', async () => {
    await setup();
    expect(screen.getByTestId('chat-rules')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('chat-empty')).toBeTruthy();
    });
  });

  it('sends a plain message and blocks a phone number', async () => {
    const { client, view } = await setup();
    await waitFor(() => {
      expect(screen.getByTestId('chat-input')).toBeTruthy();
    });
    await fireEvent.changeText(screen.getByTestId('chat-input'), 'Hall is booked');
    await fireEvent.press(screen.getByTestId('chat-send'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <GroupChatScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getAllByTestId(/^chat-message-/).length).toBe(1);
    });

    await fireEvent.changeText(screen.getByTestId('chat-input'), 'call 771234567');
    await fireEvent.press(screen.getByTestId('chat-send'));
    await waitFor(() => {
      expect(screen.getByTestId('chat-action-error')).toBeTruthy();
    });
    const listed = await container!.repositories.weddingChat.listMessages(mockId);
    if (listed.ok) expect(listed.value.length).toBe(1);
  });
});
