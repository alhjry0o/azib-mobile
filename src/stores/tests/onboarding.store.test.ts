import { act } from '@testing-library/react-native';
import { useOnboardingStore } from '../onboarding.store';

describe('onboarding.store', () => {
  beforeEach(async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: false, hydrated: true });
    });
  });

  it('starts not completed', () => {
    expect(useOnboardingStore.getState().completed).toBe(false);
  });

  it('complete() persists the completion flag in state', async () => {
    await act(async () => {
      useOnboardingStore.getState().complete();
    });
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it('reset() clears the flag (used by tests and future settings)', async () => {
    await act(async () => {
      useOnboardingStore.getState().complete();
    });
    await act(async () => {
      useOnboardingStore.getState().reset();
    });
    expect(useOnboardingStore.getState().completed).toBe(false);
  });

  it('_setHydrated flips the hydration flag', async () => {
    await act(async () => {
      useOnboardingStore.getState()._setHydrated(false);
    });
    expect(useOnboardingStore.getState().hydrated).toBe(false);
    await act(async () => {
      useOnboardingStore.getState()._setHydrated(true);
    });
    expect(useOnboardingStore.getState().hydrated).toBe(true);
  });
});
