import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { useProviderContainer } from '@/providers';
import type { ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { DevAuthScreen } from '../DevAuthScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  container = useProviderContainer();
  return null;
}

describe('DevAuthScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
    await act(async () => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('reports honestly when there is no demo session', async () => {
    render(
      <ShellProviders>
        <Probe />
        <DevAuthScreen />
      </ShellProviders>,
    );
    expect(await screen.findByTestId('dev-auth-no-session')).toBeTruthy();
    expect(screen.getByTestId('dev-auth-demo-badge')).toBeTruthy();
  });

  it('loads the session and toggles a staff role on the demo provider', async () => {
    render(
      <ShellProviders>
        <Probe />
        <DevAuthScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.auth.signIn({ email: 'dev@azib.invalid', password: 'pass1234' });
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('dev-auth-refresh'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('dev-auth-session-card')).toBeTruthy();
    });
    await act(async () => {
      fireEvent(screen.getByTestId('dev-role-reviewer'), 'valueChange', true);
    });
    await waitFor(() => {
      expect(screen.getByTestId('dev-role-reviewer').props.accessibilityState.checked).toBe(true);
    });
    const session = await container!.auth.getSession();
    expect(session.ok).toBe(true);
    if (session.ok) expect(session.value?.user.roles).toContain('reviewer');
  });

  it('goes back to the account tab', async () => {
    render(
      <ShellProviders>
        <Probe />
        <DevAuthScreen />
      </ShellProviders>,
    );
    await act(async () => {
      fireEvent.press(screen.getByTestId('dev-auth-back'));
    });
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/account');
  });
});
