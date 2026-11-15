import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { DialogHost } from '@/components/shell';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { getLanguage, setLanguage } from '@/i18n';
import { useDeviceTierStore, useHapticsStore } from '@/hooks';
import { useLanguageStore, useOnboardingStore, useShellStore } from '@/stores';
import { DevSettingsScreen } from '../DevSettingsScreen';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, navigate: jest.fn() }),
}));

function renderDev() {
  return render(
    <ShellProviders>
      <DevSettingsScreen />
      <DialogHost />
    </ShellProviders>,
  );
}

describe('DevSettingsScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockPush.mockClear();
    await resetShellStores();
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
      useDeviceTierStore.setState({ override: null });
      useHapticsStore.setState({ enabled: true });
      useLanguageStore.setState({ language: 'ar', hydrated: true });
      await setLanguage('ar');
    });
  });

  it('renders the developer badge and all sections', async () => {
    await renderDev();
    expect(screen.getByTestId('dev-badge')).toBeTruthy();
    expect(screen.getByTestId('dev-mode-control')).toBeTruthy();
    expect(screen.getByTestId('dev-tier-control')).toBeTruthy();
    expect(screen.getByTestId('dev-language-control')).toBeTruthy();
    expect(screen.getByTestId('dev-haptics-switch')).toBeTruthy();
    expect(screen.getByTestId('dev-badge-plus')).toBeTruthy();
    expect(screen.getByTestId('dev-integrations-link')).toBeTruthy();
    expect(screen.getByTestId('dev-gallery-link')).toBeTruthy();
    expect(screen.getByTestId('dev-reset-onboarding')).toBeTruthy();
  });

  it('switches AppMode to backend and clears the query cache', async () => {
    await renderDev();
    const tabs = within(screen.getByTestId('dev-mode-control')).getAllByRole('tab');
    await act(async () => {
      fireEvent.press(tabs[1]!);
    });
    await waitFor(() => {
      expect(screen.getByTestId('dev-mode-control')).toBeTruthy();
    });
  });

  it('overrides the device tier', async () => {
    await renderDev();
    const tabs = within(screen.getByTestId('dev-tier-control')).getAllByRole('tab');
    await act(async () => {
      fireEvent.press(tabs[3]!);
    });
    expect(useDeviceTierStore.getState().override).toBe('low');
    await act(async () => {
      fireEvent.press(tabs[0]!);
    });
    expect(useDeviceTierStore.getState().override).toBeNull();
  });

  it('switches language to English and persists it', async () => {
    await renderDev();
    const tabs = within(screen.getByTestId('dev-language-control')).getAllByRole('tab');
    await act(async () => {
      fireEvent.press(tabs[1]!);
    });
    await waitFor(() => {
      expect(getLanguage()).toBe('en');
    });
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('toggles haptics', async () => {
    await renderDev();
    expect(useHapticsStore.getState().enabled).toBe(true);
    await act(async () => {
      fireEvent.press(screen.getByTestId('dev-haptics-switch'));
    });
    expect(useHapticsStore.getState().enabled).toBe(false);
  });

  it('adjusts the Dock badge counter (dev-only) with a real floor at zero', async () => {
    await renderDev();
    expect(screen.getByTestId('dev-badge-minus').props.accessibilityState.disabled).toBe(true);
    await act(async () => {
      fireEvent.press(screen.getByTestId('dev-badge-plus'));
    });
    expect(useShellStore.getState().unreadNotifications).toBe(1);
    await act(async () => {
      fireEvent.press(screen.getByTestId('dev-badge-minus'));
    });
    expect(useShellStore.getState().unreadNotifications).toBe(0);
  });

  it('navigates to integrations and gallery', async () => {
    await renderDev();
    fireEvent.press(screen.getByTestId('dev-integrations-link'));
    expect(mockPush).toHaveBeenCalledWith('/(dev)/integrations');
    fireEvent.press(screen.getByTestId('dev-gallery-link'));
    expect(mockPush).toHaveBeenCalledWith('/(dev)/gallery');
  });

  it('confirms onboarding reset through the global DialogHost and navigates', async () => {
    await renderDev();
    fireEvent.press(screen.getByTestId('dev-reset-onboarding'));
    expect(useShellStore.getState().dialog).not.toBeNull();
    await act(async () => {
      fireEvent.press(screen.getByTestId('shell-dialog-confirm'));
    });
    await waitFor(() => {
      expect(useOnboardingStore.getState().completed).toBe(false);
    });
    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)');
  });

  it('goes back to the account tab', async () => {
    await renderDev();
    fireEvent.press(screen.getByTestId('dev-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/account');
  });
});
