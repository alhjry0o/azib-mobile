import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { JobsSection } from '../sections/JobsSection';

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

describe('JobsSection', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state with no open jobs', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <JobsSection />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('section-jobs-empty')).toBeTruthy();
    });
  });

  it('lists open jobs only and never renders contact details', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <JobsSection />
      </ShellProviders>,
    );
    await act(async () => {
      const repo = container!.repositories.jobs;
      const open = await repo.create({ titleKey: 'home:demo.jobs.cashier', partnerId: 'p1' });
      const closed = await repo.create({ titleKey: 'home:demo.jobs.accountant', partnerId: 'p2' });
      if (open.ok) await repo.update(open.value.id, { status: 'open' });
      if (closed.ok) await repo.update(closed.value.id, { status: 'closed' });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getAllByTestId(/jobs-item-/).length).toBe(1);
    });
    expect(screen.queryByText(/\+967/)).toBeNull();
  });
});
