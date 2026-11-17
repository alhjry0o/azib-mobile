import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { ShellProviders, createTestQueryClient, makeDemoSession, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { getLanguage, setLanguage } from '@/i18n';
import { useAuthStore, useLanguageStore, useSettingsStore } from '@/stores';
import { AppearanceSettingsScreen } from '../screens/AppearanceSettingsScreen';
import { LanguageSettingsScreen } from '../screens/LanguageSettingsScreen';
import { NotificationsSettingsScreen } from '../screens/NotificationsSettingsScreen';
import { NumbersSettingsScreen } from '../screens/NumbersSettingsScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
}));

function seededClient() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

describe('settings preferences', () => {
  beforeEach(async () => {
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
      useLanguageStore.setState({ language: 'ar', hydrated: true });
      useSettingsStore.setState({
        numberSystem: 'latn',
        appearance: 'dark',
        visibility: 'private',
        storiesConsent: false,
        notifications: { enabled: true, assistance: true, weddings: true, marketplace: false },
        hydrated: true,
      });
    });
    await act(async () => {
      await setLanguage('ar');
    });
  });

  afterEach(async () => {
    await act(async () => {
      await setLanguage('ar');
      useLanguageStore.setState({ language: 'ar', hydrated: true });
    });
  });

  it('switches the language and persists it', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <LanguageSettingsScreen />
      </ShellProviders>,
    );
    const tabs = within(screen.getByTestId('settings-language-control')).getAllByRole('tab');
    await fireEvent.press(tabs[1]!);
    await waitFor(() => {
      expect(getLanguage()).toBe('en');
    });
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('switches the numbering system and updates the preview', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <NumbersSettingsScreen />
      </ShellProviders>,
    );
    const tabs = within(screen.getByTestId('settings-numbers-control')).getAllByRole('tab');
    await fireEvent.press(tabs[1]!);
    await waitFor(() => {
      expect(useSettingsStore.getState().numberSystem).toBe('arab');
    });
    expect(screen.getByTestId('settings-numbers-preview')).toBeTruthy();
  });

  it('keeps light and system appearance disabled with a reason', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <AppearanceSettingsScreen />
      </ShellProviders>,
    );
    const tabs = within(screen.getByTestId('settings-appearance-control')).getAllByRole('tab');
    expect(tabs[1]!.props.accessibilityState.disabled).toBe(true);
    expect(tabs[2]!.props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('appearance-unavailable')).toBeTruthy();
    expect(useSettingsStore.getState().appearance).toBe('dark');
  });

  it('disables category switches when the master switch is off', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <NotificationsSettingsScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('notifications-no-push')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('notifications-master'));
    await waitFor(() => {
      expect(useSettingsStore.getState().notifications.enabled).toBe(false);
    });
    expect(screen.getByTestId('notifications-assistance').props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it('toggles the optional stories consent and the visibility setting', async () => {
    await render(
      <ShellProviders client={seededClient()}>
        <PrivacySettingsScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('privacy-stories'));
    await waitFor(() => {
      expect(useSettingsStore.getState().storiesConsent).toBe(true);
    });
    const tabs = within(screen.getByTestId('privacy-visibility-control')).getAllByRole('tab');
    await fireEvent.press(tabs[1]!);
    await waitFor(() => {
      expect(useSettingsStore.getState().visibility).toBe('reviewers');
    });
    expect(screen.getByTestId('privacy-withdraw-note')).toBeTruthy();
  });
});
