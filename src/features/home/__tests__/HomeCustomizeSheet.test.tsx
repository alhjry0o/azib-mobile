import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { HOME_SECTION_IDS } from '../config/home-config.types';
import { useAuthStore, useSettingsStore, useShellStore } from '@/stores';
import { HomeCustomizeSheet } from '../components/HomeCustomizeSheet';

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

describe('HomeCustomizeSheet', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
      useSettingsStore.setState({
        homeSectionOrder: [],
        homeSectionVisibility: {},
        homeQuickActionVisibility: {},
        hydrated: true,
      });
    });
  });

  it('lists every registered section', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeCustomizeSheet />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('customize-section-weddings')).toBeTruthy();
    });
    for (const id of HOME_SECTION_IDS) {
      expect(screen.getByTestId(`customize-section-${id}`)).toBeTruthy();
    }
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
      const order = useSettingsStore.getState().homeSectionOrder;
      expect(order[1]).toBe('offers');
      expect(order[2]).toBe('weddings');
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
