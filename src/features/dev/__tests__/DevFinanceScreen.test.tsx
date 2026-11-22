import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAppModeStore } from '@/stores';
import { DevFinanceScreen } from '../DevFinanceScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

describe('DevFinanceScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  async function setup() {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <DevFinanceScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('starts with no applications and creates an approved one', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByTestId('dev-finance-no-applications')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-finance-create-application'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-application-/).length).toBe(1);
    });
  });

  it('proposes a disbursement and enforces Maker ≠ Checker from the UI', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('dev-finance-create-application'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-application-/).length).toBe(1);
    });
    await fireEvent.press(screen.getAllByTestId(/^dev-finance-application-/)[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-finance-propose')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-finance-propose'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-disbursement-/).length).toBe(1);
    });

    // Same person as maker and checker → refused by the domain.
    await fireEvent.changeText(screen.getByTestId('dev-finance-checker'), 'dev-maker');
    const approveButtons = screen.getAllByTestId(/^dev-finance-approve-/);
    await fireEvent.press(approveButtons[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-finance-error')).toBeTruthy();
    });

    // A different checker succeeds.
    await fireEvent.changeText(screen.getByTestId('dev-finance-checker'), 'dev-checker');
    await fireEvent.press(screen.getAllByTestId(/^dev-finance-approve-/)[0]!);
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-record-/).length).toBe(1);
    });
  });

  it('records payment with a proof reference', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('dev-finance-create-application'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-application-/).length).toBe(1);
    });
    await fireEvent.press(screen.getAllByTestId(/^dev-finance-application-/)[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-finance-propose')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dev-finance-propose'));
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-approve-/).length).toBe(1);
    });
    await fireEvent.press(screen.getAllByTestId(/^dev-finance-approve-/)[0]!);
    await waitFor(() => {
      expect(screen.getAllByTestId(/^dev-finance-record-/).length).toBe(1);
    });
    await fireEvent.press(screen.getAllByTestId(/^dev-finance-record-/)[0]!);
    await waitFor(() => {
      expect(screen.getByTestId('dev-finance-message')).toBeTruthy();
    });
    expect(screen.queryAllByTestId(/^dev-finance-record-/).length).toBe(0);
  });

  it('is unavailable outside demo mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevFinanceScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('dev-finance-create-application')).toBeNull();
    expect(screen.getByTestId('dev-finance-screen')).toBeTruthy();
  });
});
