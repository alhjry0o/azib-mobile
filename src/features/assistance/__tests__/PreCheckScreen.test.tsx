import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAssistanceDraftStore } from '@/stores';
import { PreCheckScreen } from '../screens/PreCheckScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_a: string, d: string) => `sha256:${d}`),
}));

describe('PreCheckScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(() => {
      useAssistanceDraftStore.getState().reset();
    });
  });

  it('states clearly that the result is not stored', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <PreCheckScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('precheck-note')).toBeTruthy();
  });

  it('produces an advisory result without touching the draft', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <PreCheckScreen />
      </ShellProviders>,
    );
    await fireEvent.changeText(screen.getByTestId('precheck-income'), '50000');
    await fireEvent.changeText(screen.getByTestId('precheck-household'), '6');
    await fireEvent.press(screen.getByTestId('precheck-run'));
    await waitFor(() => {
      expect(screen.getByTestId('precheck-result')).toBeTruthy();
    });
    expect(screen.getByTestId('precheck-recommendation')).toBeTruthy();
    expect(useAssistanceDraftStore.getState().income.monthlyIncome).toBeNull();
    expect(useAssistanceDraftStore.getState().programId).toBeNull();
  });
});
