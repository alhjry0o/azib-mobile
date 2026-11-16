import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { useAppModeStore, useAuthStore } from '@/stores';
import { SignInScreen } from '../screens/SignInScreen';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: mockReplace, push: mockPush, navigate: jest.fn() }),
}));

describe('SignInScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockPush.mockClear();
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an inline validation error for a malformed email', async () => {
    render(
      <ShellProviders>
        <SignInScreen />
      </ShellProviders>,
    );
    await act(async () => {
      fireEvent.changeText(screen.getByTestId('sign-in-email'), 'not-an-email');
      fireEvent.changeText(screen.getByTestId('sign-in-password'), 'pass1234');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('sign-in-submit'));
    });
    await waitFor(() => {
      expect(screen.getByText(translate('auth:validation.emailInvalid'))).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('signs in through the demo provider and enters the tabs', async () => {
    render(
      <ShellProviders>
        <SignInScreen />
      </ShellProviders>,
    );
    await act(async () => {
      fireEvent.changeText(screen.getByTestId('sign-in-email'), 'demo@azib.invalid');
      fireEvent.changeText(screen.getByTestId('sign-in-password'), 'pass1234');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('sign-in-submit'));
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
    expect(screen.getByTestId('sign-in-screen-demo')).toBeTruthy();
  });

  it('shows an honest NotConnected state in backend mode', async () => {
    await act(async () => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    render(
      <ShellProviders>
        <SignInScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('sign-in-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('sign-in-submit', { includeHiddenElements: true })).toBeNull();
  });
});
