import { render, screen } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { RULES_V1 } from '../engine/rules.v1';
import { EligibilityConditionsScreen } from '../screens/EligibilityConditionsScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

describe('EligibilityConditionsScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('shows the rule version and the provisional warning', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <EligibilityConditionsScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('conditions-version')).toBeTruthy();
    expect(screen.getByTestId('conditions-pending')).toBeTruthy();
  });

  it('renders every band from the active rules', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <EligibilityConditionsScreen />
      </ShellProviders>,
    );
    for (const band of RULES_V1.bands) {
      expect(screen.getByTestId(`band-${band.id}`)).toBeTruthy();
    }
  });

  it('states that relatives wealth and inheritance are excluded', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <EligibilityConditionsScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('conditions-excluded')).toBeTruthy();
    expect(screen.getByTestId('conditions-weights')).toBeTruthy();
    expect(screen.getByTestId('conditions-gates')).toBeTruthy();
  });
});
