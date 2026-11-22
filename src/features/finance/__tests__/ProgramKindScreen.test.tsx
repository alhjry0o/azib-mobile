import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { ProgramKindScreen } from '../screens/ProgramKindScreen';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockKind = 'grant';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, navigate: jest.fn() }),
  useLocalSearchParams: () => ({ kind: mockKind }),
}));

describe('ProgramKindScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockKind = 'grant';
    await resetShellStores();
  });

  it('renders a donatable kind without a referral action', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <ProgramKindScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('program-kind-card')).toBeTruthy();
    expect(screen.queryByTestId('program-kind-referral')).toBeNull();
  });

  it('routes Qard Hasan to the licensed-provider requirements only', async () => {
    mockKind = 'qard_hasan';
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <ProgramKindScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('program-kind-souk')).toBeNull();
    await fireEvent.press(screen.getByTestId('program-kind-referral'));
    expect(mockPush).toHaveBeenCalledWith('/programs/provider-requirements');
  });

  it('routes in-kind support to Souk Khair', async () => {
    mockKind = 'in_kind';
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <ProgramKindScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('program-kind-souk'));
    expect(mockPush).toHaveBeenCalledWith('/(features)/souk');
  });

  it('shows a missing state for an unknown kind', async () => {
    mockKind = 'crypto_loan';
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <ProgramKindScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('program-kind-missing')).toBeTruthy();
  });
});
