import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore, useAuthStore } from '@/stores';
import {
  decideDisbursement,
  proposeDisbursement,
  recordDisbursementPayment,
} from '../services/disbursement-service';
import { BeneficiaryDisbursementsScreen } from '../screens/BeneficiaryDisbursementsScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

async function seedPaidDisbursement(): Promise<string> {
  const repos = container!.repositories;
  const created = await repos.applications.create({
    applicantId: 'demo-user-test',
    programId: 'p1',
    requestedAmount: 200000,
  });
  if (!created.ok) throw new Error('setup failed');
  await repos.applications.updateStatus(created.value.id, 'approved');
  const deps = {
    disbursements: repos.disbursements,
    applications: repos.applications,
    audit: repos.audit,
  };
  const proposed = await proposeDisbursement(deps, {
    applicationId: created.value.id,
    amount: 60000,
    makerId: 'maker-1',
  });
  if (!proposed.ok) throw new Error('propose failed');
  await decideDisbursement(deps, proposed.value.id, {
    checkerId: 'checker-2',
    outcome: 'approved',
  });
  await recordDisbursementPayment(deps, proposed.value.id, 'proof-1', 'finance-1');
  return proposed.value.id;
}

describe('BeneficiaryDisbursementsScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('disbursements-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('disbursements-note')).toBeTruthy();
  });

  it('lists a paid disbursement with proof and confirm/dispute actions', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedPaidDisbursement();
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`disbursement-${id}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`disbursement-proof-${id}`)).toBeTruthy();
    expect(screen.getByTestId(`disbursement-confirm-${id}`)).toBeTruthy();
    expect(screen.getByTestId(`disbursement-dispute-${id}`)).toBeTruthy();
  });

  it('confirms receipt and removes the response actions', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedPaidDisbursement();
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`disbursement-confirm-${id}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`disbursement-confirm-${id}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`disbursement-confirm-${id}`)).toBeNull();
    });
    const found = await container!.repositories.disbursements.getById(id);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('confirmed_by_beneficiary');
    }
  });

  it('requires a reason before submitting a dispute', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedPaidDisbursement();
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`disbursement-dispute-${id}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`disbursement-dispute-${id}`));
    await waitFor(() => {
      expect(screen.getByTestId('dispute-form')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('dispute-submit'));
    const stillPaid = await container!.repositories.disbursements.getById(id);
    if (stillPaid.ok && stillPaid.value) {
      expect(stillPaid.value.status).toBe('paid_recorded');
    }
    await fireEvent.changeText(screen.getByTestId('dispute-note'), 'Amount not received in full.');
    await fireEvent.press(screen.getByTestId('dispute-submit'));
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-form')).toBeNull();
    });
    const disputed = await container!.repositories.disbursements.getById(id);
    if (disputed.ok && disputed.value) expect(disputed.value.status).toBe('disputed');
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('backend'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <BeneficiaryDisbursementsScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('disbursements-empty')).toBeNull();
    expect(screen.getByTestId('beneficiary-disbursements-screen')).toBeTruthy();
  });
});
