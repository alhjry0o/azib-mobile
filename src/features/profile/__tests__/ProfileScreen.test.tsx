import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, createTestQueryClient, makeDemoSession, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useAppModeStore, useAuthStore } from '@/stores';
import { ProfileScreen } from '../screens/ProfileScreen';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ push: mockPush, replace: mockReplace, navigate: jest.fn() }),
}));

function seededClient() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

describe('ProfileScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state and creates the profile', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <ProfileScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('profile-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('profile-empty'));
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('profile-card')).toBeTruthy();
    });
    expect(screen.getByTestId('profile-demo')).toBeTruthy();
  });

  it('navigates to edit and settings once a profile exists', async () => {
    const client = seededClient();
    await render(
      <ShellProviders client={client}>
        <ProfileScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('profile-empty')).toBeTruthy();
    });
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('profile-edit')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('profile-edit'));
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    await fireEvent.press(screen.getByTestId('profile-settings'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('backend'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <ProfileScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('profile-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('profile-card', { includeHiddenElements: true })).toBeNull();
  });
});
