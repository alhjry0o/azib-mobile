import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

const mockCreate = jest.fn();
const mockWrite = jest.fn(async () => undefined);

jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///documents/' } },
  File: jest.fn().mockImplementation((directory: { uri: string }, name: string) => ({
    uri: `${directory.uri}${name}`,
    create: mockCreate,
    write: mockWrite,
  })),
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
    expect(mockWrite).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({ overwrite: true });
    const writeCall = (mockWrite as jest.Mock).mock.calls[0];
    expect(String(writeCall?.[0])).toContain('"schemaVersion": 1');
    expect(String(writeCall?.[0])).not.toContain('accessToken');
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    const shareCall = (Sharing.shareAsync as jest.Mock).mock.calls[0];
    expect(String(shareCall?.[0])).toContain('azib-export-');
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
    mockWrite.mockRejectedValueOnce(new Error('disk full'));
    await setup();
    await fireEvent.press(screen.getByTestId('export-run'));
    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeTruthy();
    });
    expect(screen.queryByTestId('export-success', { includeHiddenElements: true })).toBeNull();
  });
});
