import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAppModeStore } from '@/stores';
import { DevSoukScreen } from '../DevSoukScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

describe('DevSoukScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('starts empty in demo mode', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevSoukScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-souk-items-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('dev-souk-reports-empty')).toBeTruthy();
  });

  it('is unavailable outside demo mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevSoukScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('dev-souk-items-empty')).toBeNull();
    expect(screen.getByTestId('dev-souk-screen')).toBeTruthy();
  });

  it('renders again after switching back to demo', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <DevSoukScreen />
      </ShellProviders>,
    );
    await act(() => {
      useAppModeStore.setState({ mode: 'demo', hydrated: true });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <DevSoukScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-souk-screen')).toBeTruthy();
    });
  });
});
