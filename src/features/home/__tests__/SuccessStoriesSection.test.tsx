import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { useAuthStore, useSettingsStore } from '@/stores';
import { SuccessStoriesSection } from '../sections/SuccessStoriesSection';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: jest.fn(), replace: jest.fn() }),
}));

describe('SuccessStoriesSection', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
      useSettingsStore.setState({ storiesConsent: false, hydrated: true });
    });
  });

  it('publishes no story and explains why (D-3)', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <SuccessStoriesSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-success-stories-empty')).toBeTruthy();
    });
    expect(screen.queryAllByTestId(/story-/).length).toBe(0);
    expect(
      screen.getByText(translate('home:sections.success-stories.emptyDescription')),
    ).toBeTruthy();
  });

  it('surfaces the recorded account consent honestly', async () => {
    await act(() => {
      useSettingsStore.setState({ storiesConsent: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <SuccessStoriesSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('stories-consent-note')).toBeTruthy();
    });
  });

  it('routes the empty-state action to awareness', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <SuccessStoriesSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-success-stories-empty')).toBeTruthy();
    });
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    expect(mockNavigate).toHaveBeenCalledWith('/(features)/learn');
  });
});
