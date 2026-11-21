import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { seedAssistancePayloads } from '../../../../mocks/seed/assistance';
import { RULES_V1 } from '../engine';
import { submitAssistance } from '../services/submission-service';
import { applyTransition } from '../services/workflow-service';
import { REJECTION_REASONS } from '../config/reason-catalog';
import { DecisionScreen } from '../screens/DecisionScreen';

let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('DecisionScreen', () => {
  beforeEach(async () => {
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows a pending state when no decision exists', async () => {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DecisionScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const created = await submitAssistance(
        {
          applications: container!.repositories.applications,
          audit: container!.repositories.audit,
        },
        {
          applicantId: 'demo-user-test',
          programId: 'p1',
          requestedAmount: 150000,
          notes: null,
          payload: seedAssistancePayloads[0]!,
          rules: RULES_V1,
        },
      );
      if (created.ok) mockId = created.value.id;
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('decision-pending')).toBeTruthy();
    });
  });

  it('shows reasons and never shows scores', async () => {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DecisionScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const created = await submitAssistance(
        { applications: repos.applications, audit: repos.audit },
        {
          applicantId: 'demo-user-test',
          programId: 'p1',
          requestedAmount: 150000,
          notes: null,
          payload: seedAssistancePayloads[0]!,
          rules: RULES_V1,
        },
      );
      if (!created.ok) throw new Error('setup failed');
      mockId = created.value.id;
      const deps = { applications: repos.applications, audit: repos.audit };
      await applyTransition(deps, {
        applicationId: mockId,
        to: 'in_review',
        actor: 'reviewer',
        actorId: 'r1',
      });
      await applyTransition(deps, {
        applicationId: mockId,
        to: 'rejected',
        actor: 'reviewer',
        actorId: 'r1',
        patch: {
          decision: {
            outcome: 'rejected',
            reasonKeys: [REJECTION_REASONS[0]!.labelKey],
            reviewerId: 'r1',
            decidedAt: new Date().toISOString(),
            note: null,
          },
        },
      });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('decision-outcome')).toBeTruthy();
    });
    expect(screen.getByTestId('decision-no-scores')).toBeTruthy();
    expect(screen.getByTestId('decision-reasons')).toBeTruthy();
    expect(screen.getByTestId('decision-appeal')).toBeTruthy();
    expect(screen.queryByTestId('decision-score')).toBeNull();
  });
});
