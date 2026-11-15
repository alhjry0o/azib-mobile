import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { I18nManager } from 'react-native';
import { getLanguage, setLanguage } from '@/i18n';
import { useLanguageStore } from '@/stores';
import { LanguageBootstrap } from '../LanguageBootstrap';
import { useLanguageSwitch } from '../use-language-switch';

describe('useLanguageSwitch', () => {
  beforeEach(async () => {
    await act(async () => {
      useLanguageStore.setState({ language: 'ar', hydrated: true });
      await setLanguage('ar');
    });
  });

  afterEach(async () => {
    await act(async () => {
      await setLanguage('ar');
      useLanguageStore.setState({ language: 'ar', hydrated: true });
    });
    jest.restoreAllMocks();
  });

  it('persists the choice, switches i18n and applies the native direction', async () => {
    const forceSpy = jest.spyOn(I18nManager, 'forceRTL');
    const { result } = renderHook(() => useLanguageSwitch());

    await act(async () => {
      await result.current.switchLanguage('en');
    });
    expect(useLanguageStore.getState().language).toBe('en');
    expect(getLanguage()).toBe('en');
    expect(forceSpy).toHaveBeenCalledWith(false);

    await act(async () => {
      await result.current.switchLanguage('ar');
    });
    expect(getLanguage()).toBe('ar');
    expect(forceSpy).toHaveBeenCalledWith(true);
  });
});

describe('LanguageBootstrap', () => {
  afterEach(async () => {
    await act(async () => {
      useLanguageStore.setState({ language: 'ar', hydrated: true });
      await setLanguage('ar');
    });
  });

  it('applies the persisted language on mount', async () => {
    await act(async () => {
      useLanguageStore.setState({ language: 'en', hydrated: true });
      await setLanguage('ar');
    });
    render(<LanguageBootstrap />);
    await waitFor(() => {
      expect(getLanguage()).toBe('en');
    });
  });

  it('does nothing before hydration', async () => {
    await act(async () => {
      useLanguageStore.setState({ language: 'en', hydrated: false });
      await setLanguage('ar');
    });
    render(<LanguageBootstrap />);
    await act(async () => {});
    expect(getLanguage()).toBe('ar');
  });
});
