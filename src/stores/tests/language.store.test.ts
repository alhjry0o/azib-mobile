import { act } from '@testing-library/react-native';
import { useLanguageStore } from '../language.store';

describe('language.store', () => {
  beforeEach(async () => {
    await act(async () => {
      useLanguageStore.setState({ language: 'ar', hydrated: true });
    });
  });

  it('defaults to Arabic', () => {
    expect(useLanguageStore.getState().language).toBe('ar');
  });

  it('setLanguage updates the persisted choice', async () => {
    await act(async () => {
      useLanguageStore.getState().setLanguage('en');
    });
    expect(useLanguageStore.getState().language).toBe('en');
    await act(async () => {
      useLanguageStore.getState().setLanguage('ar');
    });
    expect(useLanguageStore.getState().language).toBe('ar');
  });

  it('_setHydrated flips the hydration flag', async () => {
    await act(async () => {
      useLanguageStore.getState()._setHydrated(false);
    });
    expect(useLanguageStore.getState().hydrated).toBe(false);
    await act(async () => {
      useLanguageStore.getState()._setHydrated(true);
    });
    expect(useLanguageStore.getState().hydrated).toBe(true);
  });
});
