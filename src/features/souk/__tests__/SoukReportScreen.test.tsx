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
import { SoukReportScreen } from '../screens/SoukReportScreen';

let mockId = 'item-1';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

jest.mock('@/components/ui/form/Select', () => ({
  Select: ({
    value,
    onChange,
    options,
    testID,
  }: {
    value: string | null;
    onChange: (v: string) => void;
    options: readonly { value: string; label: string }[];
    testID?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    const first = options[0];
    return (
      <Pressable testID={testID} onPress={() => first && onChange(first.value)}>
        <Text>{value ?? 'none'}</Text>
      </Pressable>
    );
  },
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

describe('SoukReportScreen', () => {
  beforeEach(async () => {
    mockId = 'item-1';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('requires a meaningful detail before submitting', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <SoukReportScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('souk-report-reason'));
    await fireEvent.changeText(screen.getByTestId('souk-report-detail'), 'short');
    await fireEvent.press(screen.getByTestId('souk-report-submit'));
    expect(screen.queryByTestId('souk-report-received')).toBeNull();
  });

  it('submits a valid report and writes an audit entry', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <SoukReportScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('souk-report-reason'));
    await fireEvent.changeText(
      screen.getByTestId('souk-report-detail'),
      'The description asks for money in exchange.',
    );
    await fireEvent.press(screen.getByTestId('souk-report-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-report-received')).toBeTruthy();
    });
    const reports = await container!.repositories.soukReports.listByItem('item-1');
    expect(reports.ok).toBe(true);
    if (reports.ok) expect(reports.value.length).toBe(1);
    const entries = await container!.repositories.audit.list();
    if (entries.ok) expect(entries.value.total).toBe(1);
  });
});
