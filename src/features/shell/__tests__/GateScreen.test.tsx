import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useAppModeStore, useAuthStore, useOnboardingStore } from '@/stores';
import { GateScreen } from '../GateScreen';
import { sessionQueryKey } from '../use-session';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from './test-utils';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
}));

describe('GateScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows loading first, then redirects to onboarding on first launch', async () => {
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('gate-loading')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(onboarding)')).toBeTruthy();
    });
  });

  it('redirects to welcome when onboarding is completed and there is no session', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(auth)/welcome')).toBeTruthy();
    });
  });

  it('redirects to tabs when a session exists', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(tabs)')).toBeTruthy();
    });
  });

  it('redirects a local guest to the tabs', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
      useAuthStore.setState({ guestActive: true, hydrated: true });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(tabs)')).toBeTruthy();
    });
  });

  it('shows an honest NotConnected state with a working retry in backend mode', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('gate-not-connected')).toBeTruthy();
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await fireEvent.press(buttons[0]!);
    expect(screen.getByTestId('gate-not-connected')).toBeTruthy();
  });

  it('keeps the loading view while stores are not hydrated', async () => {
    await act(async () => {
      useAppModeStore.setState({ hydrated: false });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('gate-loading')).toBeTruthy();
    expect(screen.queryByTestId('redirect:/(auth)/welcome')).toBeNull();
    await act(async () => {
      useAppModeStore.setState({ hydrated: true });
    });
  });
});
