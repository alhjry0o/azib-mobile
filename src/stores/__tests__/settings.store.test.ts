import { act } from '@testing-library/react-native';
import { useSettingsStore } from '../settings.store';

describe('settings.store', () => {
  beforeEach(async () => {
    await act(() => {
      useSettingsStore.setState({
        numberSystem: 'latn',
        appearance: 'dark',
        visibility: 'private',
        storiesConsent: false,
        notifications: { enabled: true, assistance: true, weddings: true, marketplace: false },
        hydrated: true,
      });
    });
  });

  it('has honest defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.numberSystem).toBe('latn');
    expect(state.appearance).toBe('dark');
    expect(state.visibility).toBe('private');
    expect(state.storiesConsent).toBe(false);
  });

  it('updates the numbering system and visibility', async () => {
    await act(() => {
      useSettingsStore.getState().setNumberSystem('arab');
      useSettingsStore.getState().setVisibility('reviewers');
    });
    expect(useSettingsStore.getState().numberSystem).toBe('arab');
    expect(useSettingsStore.getState().visibility).toBe('reviewers');
  });

  it('toggles the optional stories consent', async () => {
    await act(() => {
      useSettingsStore.getState().setStoriesConsent(true);
    });
    expect(useSettingsStore.getState().storiesConsent).toBe(true);
    await act(() => {
      useSettingsStore.getState().setStoriesConsent(false);
    });
    expect(useSettingsStore.getState().storiesConsent).toBe(false);
  });

  it('updates notification categories without touching the master flag', async () => {
    await act(() => {
      useSettingsStore.getState().setNotificationCategory('marketplace', true);
    });
    expect(useSettingsStore.getState().notifications.marketplace).toBe(true);
    expect(useSettingsStore.getState().notifications.enabled).toBe(true);
    await act(() => {
      useSettingsStore.getState().setNotificationsEnabled(false);
    });
    expect(useSettingsStore.getState().notifications.enabled).toBe(false);
    expect(useSettingsStore.getState().notifications.marketplace).toBe(true);
  });

  it('flips the hydration flag', async () => {
    await act(() => {
      useSettingsStore.getState()._setHydrated(false);
    });
    expect(useSettingsStore.getState().hydrated).toBe(false);
    await act(() => {
      useSettingsStore.getState()._setHydrated(true);
    });
    expect(useSettingsStore.getState().hydrated).toBe(true);
  });
});
