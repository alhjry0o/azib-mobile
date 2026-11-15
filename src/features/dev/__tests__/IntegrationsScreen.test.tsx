import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { ShellProviders, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { ALL_PROVIDER_NAMES } from '@/providers';
import { useAppModeStore } from '@/stores';
import { IntegrationsScreen } from '../IntegrationsScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function renderIntegrations() {
  return render(
    <ShellProviders>
      <IntegrationsScreen />
    </ShellProviders>,
  );
}

describe('IntegrationsScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    await resetShellStores();
  });

  it('lists all twelve providers with their initial mock status', async () => {
    await renderIntegrations();
    expect(screen.getByTestId('integrations-mode-badge')).toBeTruthy();
    for (const name of ALL_PROVIDER_NAMES) {
      const row = screen.getByTestId(`integration-${name}`);
      expect(row).toBeTruthy();
      expect(
        within(row).getByText(translate('common:shell.dev.integrations.status.mock')),
      ).toBeTruthy();
    }
  });

  it('runs real health checks and updates statuses to connected in demo mode', async () => {
    await renderIntegrations();
    fireEvent.press(screen.getByTestId('run-health-checks'));
    await waitFor(
      () => {
        const row = screen.getByTestId('integration-auth');
        expect(
          within(row).getByText(translate('common:shell.dev.integrations.status.connected')),
        ).toBeTruthy();
      },
      { timeout: 4000 },
    );
  });

  it('shows disabled then error honestly in backend mode without env', async () => {
    await act(async () => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    
    await renderIntegrations();
    const authRow = screen.getByTestId('integration-auth');
    expect(
      within(authRow).getByText(translate('common:shell.dev.integrations.status.disabled')),
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId('run-health-checks'));
    await waitFor(() => {
      expect(
        within(screen.getByTestId('integration-auth')).getByText(
          translate('common:shell.dev.integrations.status.error'),
        ),
      ).toBeTruthy();
    });
  });

  it('navigates back to developer settings', async () => {
    await renderIntegrations();
    fireEvent.press(screen.getByTestId('integrations-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(dev)');
  });
});
