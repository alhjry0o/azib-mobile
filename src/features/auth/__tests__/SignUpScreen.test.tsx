import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { useAuthStore } from '@/stores';
import { SignUpScreen } from '../screens/SignUpScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

async function fillValidForm(): Promise<void> {
  await fireEvent.changeText(screen.getByTestId('sign-up-name'), 'Demo Person');
  await fireEvent.changeText(screen.getByTestId('sign-up-email'), 'new@azib.invalid');
  await fireEvent.changeText(screen.getByTestId('sign-up-password'), 'pass1234');
}

describe('SignUpScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('blocks submission until both consents are accepted', async () => {
    await render(
      <ShellProviders>
        <SignUpScreen />
      </ShellProviders>,
    );
    await fillValidForm();
    await fireEvent.press(screen.getByTestId('sign-up-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('sign-up-consent-error')).toBeTruthy();
    });
    expect(screen.getByText(translate('auth:validation.consentRequired'))).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('creates the account, records consents and moves to verification', async () => {
    await render(
      <ShellProviders>
        <SignUpScreen />
      </ShellProviders>,
    );
    await fillValidForm();
    await fireEvent.press(screen.getByTestId('sign-up-terms'));
    await fireEvent.press(screen.getByTestId('sign-up-privacy'));
    await fireEvent.press(screen.getByTestId('sign-up-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/verify');
    });
    const challenge = useAuthStore.getState().challenge;
    expect(challenge?.target).toBe('new@azib.invalid');
    expect(challenge?.demoCode).toMatch(/^\d{6}$/);
  });

  it('renders the password strength meter', async () => {
    await render(
      <ShellProviders>
        <SignUpScreen />
      </ShellProviders>,
    );
    await fillValidForm();
    expect(screen.getByTestId('sign-up-strength')).toBeTruthy();
  });
});
