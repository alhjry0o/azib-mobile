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
import { INFO_REQUEST_FIELDS } from '../config/reason-catalog';
import { InfoRequestScreen } from '../screens/InfoRequestScreen';

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

describe('InfoRequestScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <InfoRequestScreen />
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
      const field = INFO_REQUEST_FIELDS[0]!;
      await applyTransition(
        { applications: repos.applications, audit: repos.audit },
        {
          applicationId: mockId,
          to: 'info_requested',
          actor: 'reviewer',
          actorId: 'reviewer-1',
          patch: {
            infoRequest: {
              items: [{ fieldKey: field.labelKey, reasonKey: field.reasonKey }],
              requestedAt: new Date().toISOString(),
              reviewerId: 'reviewer-1',
            },
          },
        },
      );
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('info-request-items')).toBeTruthy();
    });
    return client;
  }

  it('shows the requested items respectfully', async () => {
    await setup();
    expect(screen.getByTestId('info-request-intro')).toBeTruthy();
  });

  it('updates figures and resubmits, clearing the request', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('info-income'), '95000');
    await fireEvent.changeText(screen.getByTestId('info-notes'), 'Updated income proof attached.');
    await fireEvent.press(screen.getByTestId('info-request-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/assistance/${mockId}`);
    });
    const found = await container!.repositories.applications.getById(mockId);
    expect(found.ok).toBe(true);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('submitted');
      expect(found.value.infoRequest).toBeNull();
      expect(found.value.payload?.income.monthlyIncome).toBe(95000);
    }
  });
});
