import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { SupportCasesSection } from '../sections/SupportCasesSection';

const mockNavigate = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: jest.fn(), replace: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('SupportCasesSection', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
    });
  });

  it('stays honestly empty even after a case is approved', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <SupportCasesSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repo = container!.repositories.applications;
      const created = await repo.create({
        applicantId: 'seed-user-1',
        programId: 'seed-program-1',
        requestedAmount: 150000,
        notes: 'identifying text',
      });
      if (created.ok) await repo.updateStatus(created.value.id, 'approved');
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('section-support-cases-empty')).toBeTruthy();
    });
    expect(screen.queryAllByTestId(/support-case-/).length).toBe(0);
    expect(
      screen.getByText(translate('home:sections.support-cases.emptyDescription')),
    ).toBeTruthy();
  });

  it('offers a real action from the empty state', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <SupportCasesSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-support-cases-empty')).toBeTruthy();
    });
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    expect(mockNavigate).toHaveBeenCalledWith('/assistance');
  });
});
