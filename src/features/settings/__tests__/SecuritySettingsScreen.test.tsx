import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { translate } from '@/i18n';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore, useSettingsStore } from '@/stores';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  authenticateAsync: jest.fn(async () => ({ success: true })),
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('SecuritySettingsScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
      useSettingsStore.setState({ biometricLock: false, hydrated: true });
    });
  });

  async function setup() {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <SecuritySettingsScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.auth.signIn({ email: 'sec@azib.invalid', password: 'pass1234' });
      const session = await container!.auth.getSession();
      client.setQueryData(sessionQueryKey('demo'), session);
    });
    await waitFor(() => {
      expect(screen.getByTestId('security-current-password')).toBeTruthy();
    });
    return client;
  }

  it('rejects a wrong current password with an inline error', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('security-current-password'), 'wrong1234');
    await fireEvent.changeText(screen.getByTestId('security-new-password'), 'newpass123');
    await fireEvent.changeText(screen.getByTestId('security-confirm-password'), 'newpass123');
    await fireEvent.press(screen.getByTestId('security-change-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('security-error')).toBeTruthy();
    });
    expect(screen.getByText(translate('auth:codes.INVALID_CREDENTIALS'))).toBeTruthy();
  });

  it('changes the password and clears the form', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('security-current-password'), 'pass1234');
    await fireEvent.changeText(screen.getByTestId('security-new-password'), 'newpass123');
    await fireEvent.changeText(screen.getByTestId('security-confirm-password'), 'newpass123');
    await fireEvent.press(screen.getByTestId('security-change-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('security-change-submit').props.accessibilityState.busy).toBe(
        false,
      );
    });
    const login = await container!.auth.signIn({
      email: 'sec@azib.invalid',
      password: 'newpass123',
    });
    expect(login.ok).toBe(true);
  });

  it('blocks submission when the confirmation does not match', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('security-current-password'), 'pass1234');
    await fireEvent.changeText(screen.getByTestId('security-new-password'), 'newpass123');
    await fireEvent.changeText(screen.getByTestId('security-confirm-password'), 'different1');
    await fireEvent.press(screen.getByTestId('security-change-submit'));
    await waitFor(() => {
      expect(screen.getByText(translate('auth:validation.passwordMismatch'))).toBeTruthy();
    });
  });

  it('toggles the biometric lock preference', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('security-biometric-switch'));
    await waitFor(() => {
      expect(useSettingsStore.getState().biometricLock).toBe(true);
    });
  });

  it('opens the devices screen', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('security-open-devices'));
    expect(mockPush).toHaveBeenCalledWith('/settings/devices');
  });
});
