import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { ExportDataScreen } from '../screens/ExportDataScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///documents/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('ExportDataScreen', () => {
  beforeEach(async () => {
    container = null;
    jest.clearAllMocks();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <ExportDataScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.auth.signIn({ email: 'export@azib.invalid', password: 'pass1234' });
      const session = await container!.auth.getSession();
      client.setQueryData(sessionQueryKey('demo'), session);
    });
    await waitFor(() => {
      expect(screen.getByTestId('export-run')).toBeTruthy();
    });
  }

  it('writes a JSON file and opens the share sheet', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('export-run'));
    await waitFor(() => {
      expect(screen.getByTestId('export-run').props.accessibilityState.busy).toBe(false);
    });
    await waitFor(() => {
      expect(screen.getByTestId('export-success')).toBeTruthy();
    });
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const call = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
    expect(String(call?.[0])).toContain('azib-export-');
    expect(String(call?.[1])).toContain('"schemaVersion": 1');
    expect(String(call?.[1])).not.toContain('accessToken');
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
  });

  it('reports honestly when sharing is unavailable', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    await setup();
    await fireEvent.press(screen.getByTestId('export-run'));
    await waitFor(() => {
      expect(screen.getByTestId('export-success')).toBeTruthy();
    });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('surfaces a write failure without claiming success', async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await setup();
    await fireEvent.press(screen.getByTestId('export-run'));
    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeTruthy();
    });
    expect(screen.queryByTestId('export-success', { includeHiddenElements: true })).toBeNull();
  });
});
