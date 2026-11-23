import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DialogHost } from '@/components/shell';
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
import { ApplicationDetailScreen } from '../screens/ApplicationDetailScreen';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

async function seedApplication(applicantId: string): Promise<string> {
  const created = await submitAssistance(
    {
      applications: container!.repositories.applications,
      audit: container!.repositories.audit,
    },
    {
      applicantId,
      programId: 'p1',
      requestedAmount: 150000,
      notes: null,
      payload: seedAssistancePayloads[0]!,
      rules: RULES_V1,
    },
  );
  if (!created.ok) throw new Error('setup failed');
  return created.value.id;
}

describe('ApplicationDetailScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(applicantId = 'demo-user-test') {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <ApplicationDetailScreen />
        <DialogHost />
      </ShellProviders>,
    );

    await act(async () => {
      const created = await submitAssistance(
        {
          applications: container!.repositories.applications,
          audit: container!.repositories.audit,
        },
        {
          applicantId,
          programId: 'p1',
          requestedAmount: 150000,
          notes: null,
          payload: seedAssistancePayloads[0]!,
          rules: RULES_V1,
        },
      );
      if (created.ok) {
        mockId = created.value.id;
      }
    }); 
    
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['assistance'] });
    });
    
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <ApplicationDetailScreen />
        <DialogHost />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('renders the reference, status and timeline', async () => {
    const { view } = await setup();
    await waitFor(() => {
      expect(view.getByTestId('detail-reference')).toBeTruthy();
    });
    expect(view.getByTestId('detail-status')).toBeTruthy();
    expect(view.getByTestId('status-timeline')).toBeTruthy();
  });

  it('never shows another applicant application', async () => {
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <ApplicationDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = await seedApplication('someone-else');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['assistance'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <ApplicationDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(view.getByTestId('forbidden-view')).toBeTruthy();
    });
  });
  
  it('cancels only after confirming in the global dialog', async () => {
    const { view } = await setup();
    await waitFor(() => {
      expect(view.getByTestId('detail-cancel')).toBeTruthy();
    });
    await fireEvent.press(view.getByTestId('detail-cancel'));
    expect(view.getByTestId('shell-dialog')).toBeTruthy();
    await fireEvent.press(view.getByTestId('shell-dialog-confirm'));
    await waitFor(() => {
      expect(view.queryByTestId('detail-cancel', { includeHiddenElements: true })).toBeNull();
    });
  });
});
