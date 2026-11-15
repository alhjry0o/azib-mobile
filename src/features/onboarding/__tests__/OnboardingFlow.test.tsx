import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { I18nManager } from 'react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { getLanguage, setLanguage } from '@/i18n';
import { useLanguageStore, useOnboardingStore } from '@/stores';
import { OnboardingFlow } from '../OnboardingFlow';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function renderFlow() {
  return render(
    <Providers>
      <OnboardingFlow />
    </Providers>,
  );
}

async function goToLanguageStep(): Promise<void> {
  for (let i = 0; i < 4; i += 1) {
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-continue'));
    });
  }
  expect(screen.getByTestId('onboarding-step-language')).toBeTruthy();
}

describe('OnboardingFlow', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await act(async () => {
      useOnboardingStore.setState({ completed: false, hydrated: true });
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

  it('starts at the brand step with an always-visible skip and no back button', async () => {
    await renderFlow();
    expect(screen.getByTestId('onboarding-step-brand')).toBeTruthy();
    expect(screen.getByTestId('onboarding-skip')).toBeTruthy();
    expect(screen.getByTestId('onboarding-progress')).toBeTruthy();
    expect(screen.queryByTestId('onboarding-back', { includeHiddenElements: true })).toBeNull();
  });

  it('walks through all five steps in order', async () => {
    await renderFlow();
    const order = ['mission', 'features', 'privacy', 'language'] as const;
    for (const step of order) {
      await act(async () => {
        fireEvent.press(screen.getByTestId('onboarding-continue'));
      });
      expect(screen.getByTestId(`onboarding-step-${step}`)).toBeTruthy();
    }
  });

  it('goes back to the previous step', async () => {
    await renderFlow();
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-continue'));
    });
    expect(screen.getByTestId('onboarding-step-mission')).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-back'));
    });
    expect(screen.getByTestId('onboarding-step-brand')).toBeTruthy();
  });

  it('skip completes onboarding and navigates to sign-in', async () => {
    await renderFlow();
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-skip'));
    });
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('finish on the last step completes onboarding and navigates to sign-in', async () => {
    await renderFlow();
    await goToLanguageStep();
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-continue'));
    });
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
  });

  it('switches language to English, persists it and applies forceRTL(false)', async () => {
    const forceSpy = jest.spyOn(I18nManager, 'forceRTL');
    await renderFlow();
    await goToLanguageStep();
    await act(async () => {
      fireEvent.press(screen.getByText('English'));
    });
    await waitFor(() => {
      expect(getLanguage()).toBe('en');
    });
    expect(useLanguageStore.getState().language).toBe('en');
    expect(forceSpy).toHaveBeenCalledWith(false);
  });
});
