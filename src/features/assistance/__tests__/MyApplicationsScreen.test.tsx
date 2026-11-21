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
import { MyApplicationsScreen } from '../screens/MyApplicationsScreen';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, navigate: jest.fn() }),
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

describe('MyApplicationsScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockReplace.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state with a real action', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <MyApplicationsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('mine-empty')).toBeTruthy();
    });
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[buttons.length - 1]!);
    expect(mockReplace).toHaveBeenCalledWith('/assistance');
  });

  it('lists the applicant applications and opens one', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <MyApplicationsScreen />
      </ShellProviders>,
    );
    let id = '';
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
      if (created.ok) id = created.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['assistance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId(`application-${id}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`application-status-${id}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`application-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/assistance/${id}`);
  });
});
