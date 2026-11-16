import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { useAuthStore } from '@/stores';
import { useProviderContainer } from '@/providers';
import type { ProviderContainer } from '@/providers';
import { VerifyScreen } from '../screens/VerifyScreen';
import { useEffect } from 'react';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();

  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);

  return null;
}

async function seedPendingAccount(): Promise<string> {
  const auth = container!.auth;
  const created = await auth.signUp({
    displayName: 'Verify Person',
    email: 'verify@azib.invalid',
    password: 'pass1234',
    roleIntent: 'applicant',
    consents: [],
  });
  if (!created.ok) throw new Error('setup failed');
  const pending = created.value.pendingVerification;
  if (!pending?.challengeId) throw new Error('no pending verification');
  await act(() => {
    useAuthStore.setState({
      challenge: {
        id: pending.challengeId!,
        channel: pending.channel,
        target: pending.target,
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        demoCode: pending.demoCode ?? null,
      },
    });
  });
  return pending.demoCode ?? '';
}

describe('VerifyScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('redirects to welcome when there is no pending verification', async () => {
    render(
      <ShellProviders>
        <Probe />
        <VerifyScreen />
      </ShellProviders>,
    );
    expect(await screen.findByTestId('redirect:/(auth)/welcome')).toBeTruthy();
  });

  it('verifies the demo code and enters the tabs', async () => {
    render(
      <ShellProviders>
        <Probe />
        <VerifyScreen />
      </ShellProviders>,
    );
    let code = '';
    await act(async () => {
      code = await seedPendingAccount();
    });
    await waitFor(() => {
      expect(screen.getByTestId('verify-demo-code')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.changeText(screen.getByTestId('verify-code'), code);
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('verify-submit'));
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
    expect(useAuthStore.getState().challenge).toBeNull();
  });

  it('disables resend during the cooldown window', async () => {
    render(
      <ShellProviders>
        <Probe />
        <VerifyScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await seedPendingAccount();
    });
    await waitFor(() => {
      expect(screen.getByTestId('verify-resend')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('verify-resend'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('verify-resend').props.accessibilityState.disabled).toBe(true);
    });
  });
});
