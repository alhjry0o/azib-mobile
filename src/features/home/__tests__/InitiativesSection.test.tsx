import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { translate } from '@/i18n';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { InitiativesSection } from '../sections/InitiativesSection';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('InitiativesSection', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state with no open program', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <InitiativesSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-initiatives-empty')).toBeTruthy();
    });
  });

  it('lists open programs without exposing amounts', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <InitiativesSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repo = container!.repositories.programs;
      const open = await repo.create({
        nameKey: 'home:demo.programs.marriage',
        descriptionKey: 'home:demo.programs.marriageDesc',
        minAmount: 50000,
        maxAmount: 300000,
      });
      const closed = await repo.create({
        nameKey: 'home:demo.programs.seasonal',
        descriptionKey: 'home:demo.programs.seasonalDesc',
        minAmount: 20000,
        maxAmount: 150000,
      });
      if (open.ok) await repo.update(open.value.id, { status: 'open' });
      if (closed.ok) await repo.update(closed.value.id, { status: 'closed' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/initiative-/).length).toBe(1);
    });
    expect(screen.getByText(translate('home:demo.programs.marriage'))).toBeTruthy();
    expect(screen.queryByText(/300000/)).toBeNull();
    expect(screen.queryByText(/50000/)).toBeNull();
  });
});
