import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useAppModeStore, useOnboardingStore } from '@/stores';
import { SignInPlaceholder } from '../SignInPlaceholder';
import { sessionQueryKey } from '../use-session';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from './test-utils';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    navigate: jest.fn(),
  }),
}));

describe('SignInPlaceholder', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
  });

  it('signs in through the mock provider in demo mode and navigates to tabs', async () => {
    await render(
      <ShellProviders>
        <SignInPlaceholder />
      </ShellProviders>,
    );
    expect(screen.getByTestId('sign-in-demo-badge')).toBeTruthy();
    fireEvent.press(screen.getByTestId('demo-sign-in'));
    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
      },
      { timeout: 4000 },
    );
  });

  it('shows an honest NotConnected state in backend mode (no demo button)', async () => {
    await act(async () => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
  
    await render(
      <ShellProviders>
        <SignInPlaceholder />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('sign-in-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('demo-sign-in')).toBeNull();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('redirects to tabs when a session already exists', async () => {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <SignInPlaceholder />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(tabs)')).toBeTruthy();
    });
  });
});
