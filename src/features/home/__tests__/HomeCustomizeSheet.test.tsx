import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAuthStore, useSettingsStore, useShellStore } from '@/stores';
import { HomeCustomizeSheet } from '../components/HomeCustomizeSheet';

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

describe('HomeCustomizeSheet', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
      useSettingsStore.setState({
        homeSectionOrder: [],
        homeSectionVisibility: {},
        homeQuickActionVisibility: {},
        hydrated: true,
      });
    });
  });

  it('lists only registered sections', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeCustomizeSheet />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('customize-section-weddings')).toBeTruthy();
    });
    expect(screen.getByTestId('customize-section-jobs')).toBeTruthy();
    expect(screen.queryByTestId('customize-section-support-cases')).toBeNull();
  });

  it('hides a section and persists the choice', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeCustomizeSheet />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('customize-visible-souk')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('customize-visible-souk'));
    await waitFor(() => {
      expect(useSettingsStore.getState().homeSectionVisibility.souk).toBe(false);
    });
  });

  it('reorders sections and restores defaults', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeCustomizeSheet />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('customize-down-weddings')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('customize-down-weddings'));
    await waitFor(() => {
      expect(useSettingsStore.getState().homeSectionOrder[0]).toBe('offers');
    });
    await fireEvent.press(screen.getByTestId('customize-reset'));
    await waitFor(() => {
      expect(useSettingsStore.getState().homeSectionOrder).toEqual([]);
    });
  });

  it('toggles a quick action and closes the sheet', async () => {
    await act(() => {
      useShellStore.getState().openSheet({ content: null });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeCustomizeSheet />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('customize-quick-jobs')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('customize-quick-jobs'));
    await waitFor(() => {
      expect(useSettingsStore.getState().homeQuickActionVisibility.jobs).toBe(false);
    });
    await fireEvent.press(screen.getByTestId('customize-done'));
    expect(useShellStore.getState().sheet).toBeNull();
  });
});
