import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DialogHost } from '@/components/shell';
import { ShellProviders, createTestQueryClient, makeDemoSession, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useAuthStore } from '@/stores';
import { SettingsIndexScreen } from '../screens/SettingsIndexScreen';

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

describe('SettingsIndexScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('renders working rows and honest upcoming rows', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <SettingsIndexScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('settings-row-account')).toBeTruthy();
    expect(screen.getByTestId('settings-row-language')).toBeTruthy();
    expect(screen.getByTestId('settings-upcoming-security')).toBeTruthy();
    expect(screen.getByTestId('settings-upcoming-deleteAccount')).toBeTruthy();
  });

  it('navigates to each implemented screen', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <SettingsIndexScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('settings-row-privacy'));
    expect(mockPush).toHaveBeenCalledWith('/settings/privacy');
    await fireEvent.press(screen.getByTestId('settings-row-profile'));
    expect(mockPush).toHaveBeenCalledWith('/profile');
    await fireEvent.press(screen.getByTestId('settings-row-about'));
    expect(mockPush).toHaveBeenCalledWith('/settings/about');
  });

  it('signs out only after confirming in the global dialog', async () => {
    const client = seededClient();
    await render(
      <ShellProviders client={client}>
        <SettingsIndexScreen />
        <DialogHost />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('settings-sign-out'));
    expect(screen.getByTestId('shell-dialog')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('shell-dialog-confirm'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome');
    });
  });

  it('returns to the account tab', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <SettingsIndexScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('settings-screen-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/account');
  });
});
