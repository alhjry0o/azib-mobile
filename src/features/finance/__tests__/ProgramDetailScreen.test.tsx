import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import type { ProgramKind } from '@/repositories/contracts/program';
import { ProgramDetailScreen } from '../screens/ProgramDetailScreen';

const mockPush = jest.fn();
let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

async function seedProgram(kind: ProgramKind, open: boolean): Promise<string> {
  const created = await container!.repositories.programs.create({
    nameKey: 'assistance:finance.catalog.title',
    descriptionKey: 'assistance:finance.catalog.subtitle',
    minAmount: 1000,
    maxAmount: 100000,
    kind,
  });
  if (!created.ok) throw new Error('setup failed');
  if (open) await container!.repositories.programs.update(created.value.id, { status: 'open' });
  return created.value.id;
}

describe('ProgramDetailScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockId = '';
    container = null;
    await resetShellStores();
  });

  async function setup(kind: ProgramKind, open: boolean) {
    const client = createTestQueryClient();
    const { rerender } = render(
      <ShellProviders client={client}>
        <Probe />
        <ProgramDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = await seedProgram(kind, open);
    });
    rerender(
      <ShellProviders client={client}>
        <Probe />
        <ProgramDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId('program-detail-card')).toBeTruthy();
    });
    return client;
  }

  it('offers donation for an open donatable program', async () => {
    await setup('grant', true);
    expect(screen.getByTestId('program-detail-range')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('program-detail-donate'));
    expect(mockPush).toHaveBeenCalledWith(`/programs/donate/${mockId}`);
  });

  it('never offers donation for a referral-only kind', async () => {
    await setup('qard_hasan', true);
    expect(screen.queryByTestId('program-detail-donate')).toBeNull();
    expect(screen.getByTestId('program-detail-blocked')).toBeTruthy();
  });

  it('never offers donation for a closed program', async () => {
    await setup('grant', false);
    expect(screen.queryByTestId('program-detail-donate')).toBeNull();
  });

  it('shows a missing state for an unknown id', async () => {
    const client = createTestQueryClient();
    const { rerender } = render(
      <ShellProviders client={client}>
        <Probe />
        <ProgramDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = 'does-not-exist';
    });
    rerender(
      <ShellProviders client={client}>
        <Probe />
        <ProgramDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId('program-detail-missing')).toBeTruthy();
    });
  });
});
