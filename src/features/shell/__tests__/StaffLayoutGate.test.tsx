import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useOnboardingStore } from '@/stores';
import { StaffLayoutGate } from '../StaffLayoutGate';
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
  Stack: () => null,
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

describe('StaffLayoutGate', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
  });

  it('redirects guests to sign-in', async () => {
    render(
      <ShellProviders>
        <StaffLayoutGate />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(auth)/sign-in')).toBeTruthy();
    });
  });

  it('shows Forbidden for signed-in users without a staff role', async () => {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    render(
      <ShellProviders client={client}>
        <StaffLayoutGate />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('forbidden-view')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('forbidden-back-home'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
