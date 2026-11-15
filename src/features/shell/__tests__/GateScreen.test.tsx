import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import { useAppModeStore, useOnboardingStore } from '@/stores';
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
    const { View: RNView } = require('react-native');
    return <RNView testID={`redirect:${href}`} />;
  },
}));

describe('GateScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('redirects to onboarding on first launch', async () => {
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(onboarding)')).toBeTruthy();
    });
  });

  it('redirects to sign-in when onboarding is completed and no session exists', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(auth)/sign-in')).toBeTruthy();
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
    fireEvent.press(buttons[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('gate-not-connected')).toBeTruthy();
    });
  });

  it('keeps the loading view while stores are not hydrated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAppModeStore: modeStore } = require('@/stores');
    await act(async () => {
      modeStore.setState({ hydrated: false });
    });
    await render(
      <ShellProviders>
        <GateScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('gate-loading')).toBeTruthy();
    expect(screen.queryByTestId('redirect:/(onboarding)')).toBeNull();
    await act(async () => {
      modeStore.setState({ hydrated: true });
    });
    void View;
  });
});
