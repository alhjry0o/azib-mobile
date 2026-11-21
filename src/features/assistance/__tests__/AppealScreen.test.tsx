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
import { useAuthStore } from '@/stores';
import { seedAssistancePayloads } from '../../../../mocks/seed/assistance';
import { RULES_V1 } from '../engine';
import { submitAssistance } from '../services/submission-service';
import { applyTransition } from '../services/workflow-service';
import { REJECTION_REASONS } from '../config/reason-catalog';
import { AppealScreen } from '../screens/AppealScreen';

const mockReplace = jest.fn();
let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

jest.mock('../components/DocumentUploader', () => ({
  DocumentUploader: () => null,
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

async function rejectedApplication(decidedAt: string): Promise<string> {
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
  const deps = { applications: repos.applications, audit: repos.audit };
  await applyTransition(deps, {
    applicationId: created.value.id,
    to: 'in_review',
    actor: 'reviewer',
    actorId: 'r1',
  });
  await applyTransition(deps, {
    applicationId: created.value.id,
    to: 'rejected',
    actor: 'reviewer',
    actorId: 'r1',
    patch: {
      decision: {
        outcome: 'rejected',
        reasonKeys: [REJECTION_REASONS[0]!.labelKey],
        reviewerId: 'r1',
        decidedAt,
        note: null,
      },
    },
  });
  return created.value.id;
}

describe('AppealScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(decidedAt: string) {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <AppealScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = await rejectedApplication(decidedAt);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['assistance'] });
    });
    return client;
  }

  it('validates the statement before submitting', async () => {
    await setup(new Date().toISOString());
    await waitFor(() => {
      expect(screen.getByTestId('appeal-statement')).toBeTruthy();
    });
    await fireEvent.changeText(screen.getByTestId('appeal-statement'), 'too short');
    await fireEvent.press(screen.getByTestId('appeal-submit'));
    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('submits one appeal and returns to the detail screen', async () => {
    await setup(new Date().toISOString());
    await waitFor(() => {
      expect(screen.getByTestId('appeal-window')).toBeTruthy();
    });
    await fireEvent.changeText(
      screen.getByTestId('appeal-statement'),
      'I have attached the missing income proof for review.',
    );
    await fireEvent.press(screen.getByTestId('appeal-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/assistance/${mockId}`);
    });
    const found = await container!.repositories.applications.getById(mockId);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('appealed');
      expect(found.value.appeal?.status).toBe('pending');
    }
  });

  it('refuses an appeal outside the window', async () => {
    await setup('2020-01-01T00:00:00.000Z');
    await waitFor(() => {
      expect(screen.getByTestId('appeal-unavailable')).toBeTruthy();
    });
  });
});
