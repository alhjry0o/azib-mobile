import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAppModeStore } from '@/stores';
import { DevAssistanceScreen } from '../DevAssistanceScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_a: string, d: string) => `${d}${'x'.repeat(64)}`.slice(0, 64)),
}));

describe('DevAssistanceScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
  });

  it('starts empty and creates a complete demo application', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevAssistanceScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-assistance-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-assistance-create'));
    await waitFor(() => {
      expect(screen.getByTestId('dev-assistance-message')).toBeTruthy();
    });
    expect(screen.queryByTestId('dev-assistance-empty', { includeHiddenElements: true })).toBeNull();
  });

  it('runs a reviewer transition through the workflow service', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevAssistanceScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('dev-assistance-create'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/dev-application-/).length).toBeGreaterThan(0);
    });
    const rows = screen.getAllByTestId(/dev-application-/);
    await fireEvent.press(rows[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-transition-in_review')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-transition-in_review'));
    await waitFor(() => {
      expect(screen.getByTestId('dev-transition-approved')).toBeTruthy();
    });
  });

  it('asks for reasons before approving', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevAssistanceScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('dev-assistance-create'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/dev-application-/).length).toBeGreaterThan(0);
    });
    await fireEvent.press(screen.getAllByTestId(/dev-application-/)[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-transition-in_review')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-transition-in_review'));
    await waitFor(() => {
      expect(screen.getByTestId('dev-transition-approved')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-transition-approved'));
    await waitFor(() => {
      expect(screen.getByTestId('dev-assistance-picker')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-picker-apply'));
    await waitFor(() => {
      expect(screen.getByTestId('dev-current-status')).toBeTruthy();
    });
  });

  it('is unavailable outside demo mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevAssistanceScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('dev-assistance-create')).toBeNull();
  });
});
