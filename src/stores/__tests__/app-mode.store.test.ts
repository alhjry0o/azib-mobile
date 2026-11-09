import { useAppModeStore, APP_MODE_STORAGE_KEY } from '@/stores/app-mode.store';

describe('useAppModeStore', () => {
  beforeEach(async () => {
    // Reset store and storage between tests.
    useAppModeStore.setState({ mode: 'demo', hydrated: false });
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.clear();
  });

  it('defaults to demo mode', () => {
    expect(useAppModeStore.getState().mode).toBe('demo');
  });

  it('setMode updates mode', () => {
    useAppModeStore.getState().setMode('backend');
    expect(useAppModeStore.getState().mode).toBe('backend');
  });

  it('_setHydrated sets hydrated flag', () => {
    useAppModeStore.getState()._setHydrated(true);
    expect(useAppModeStore.getState().hydrated).toBe(true);
  });

  it('persist key is stable', () => {
    expect(APP_MODE_STORAGE_KEY).toBe('azib.app-mode.v1');
  });
});
