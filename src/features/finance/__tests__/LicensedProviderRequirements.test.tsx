import { render, screen } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { LicensedProviderRequirementsScreen } from '../screens/LicensedProviderRequirementsScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
}));

describe('LicensedProviderRequirementsScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('states honestly that the provider is not connected', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <LicensedProviderRequirementsScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('provider-requirements-state')).toBeTruthy();
    expect(screen.getByTestId('provider-requirements-note')).toBeTruthy();
  });

  it('lists all five wiring requirements', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <LicensedProviderRequirementsScreen />
      </ShellProviders>,
    );
    for (const key of ['licensed', 'agreement', 'keys', 'webhook', 'serverVerification']) {
      expect(screen.getByTestId(`provider-requirement-${key}`)).toBeTruthy();
    }
  });
});
