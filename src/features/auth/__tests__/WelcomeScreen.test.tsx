import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { useAuthStore } from '@/stores';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RequireAuth } from '../RequireAuth';

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

describe('WelcomeScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows the three entry points and the guest limitations notice', async () => {
  await render(
      <ShellProviders>
        <WelcomeScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('welcome-sign-in')).toBeTruthy();
    expect(screen.getByTestId('welcome-sign-up')).toBeTruthy();
    expect(screen.getByTestId('welcome-guest')).toBeTruthy();
    expect(screen.getByTestId('welcome-guest-notice')).toBeTruthy();
  });

  it('navigates to sign-in and sign-up', async () => {
    await render(
      <ShellProviders>
        <WelcomeScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('welcome-sign-in'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in');
    await fireEvent.press(screen.getByTestId('welcome-sign-up'));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up');
  });

  it('starts a local guest session and enters the tabs', async () => {
    await render(
      <ShellProviders>
        <WelcomeScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('welcome-guest'));
    expect(useAuthStore.getState().guestActive).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});

describe('RequireAuth (guest guard)', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
    });
  });

  it('redirects guests to welcome instead of rendering protected content', async () => {
    await render(
      <ShellProviders>
        <RequireAuth>
          <Text testID="protected">secret</Text>
        </RequireAuth>
      </ShellProviders>,
    );
    expect(await screen.findByTestId('redirect:/(auth)/welcome')).toBeTruthy();
    expect(screen.queryByTestId('protected', { includeHiddenElements: true })).toBeNull();
  });
});
