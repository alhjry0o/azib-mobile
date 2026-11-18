import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { DevicesScreen } from '../screens/DevicesScreen';

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

describe('DevicesScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DevicesScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.auth.signIn({ email: 'devices@azib.invalid', password: 'pass1234' });
      const session = await container!.auth.getSession();
      client.setQueryData(sessionQueryKey('demo'), session);
    });
    await waitFor(() => {
      expect(screen.getByTestId('device-demo-session-1')).toBeTruthy();
    });
    return client;
  }

  it('lists the demo sessions with a current marker', async () => {
    await setup();
    expect(screen.getByTestId('devices-demo-note')).toBeTruthy();
    expect(screen.getByTestId('device-current-demo-session-1')).toBeTruthy();
  });

  it('revokes the current session and returns to welcome', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('device-revoke-demo-session-1'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome');
    });
  });

  it('keeps other sessions when a non-current one is revoked', async () => {
    const client = await setup();
    await act(async () => {
      await container!.auth.signIn({ email: 'devices@azib.invalid', password: 'pass1234' });
      const session = await container!.auth.getSession();
      client.setQueryData(sessionQueryKey('demo'), session);
    });
    await fireEvent.press(screen.getByTestId('devices-refresh'));
    await waitFor(() => {
      expect(screen.getByTestId('device-demo-session-2')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('device-revoke-demo-session-1'));
    await waitFor(() => {
      expect(screen.queryByTestId('device-demo-session-1', { includeHiddenElements: true })).toBeNull();
    });
    expect(screen.getByTestId('device-demo-session-2')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows an honest empty state when signed out', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DevicesScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('devices-empty')).toBeTruthy();
    });
  });
});
