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
import { PartnerRegisterScreen } from '../screens/PartnerRegisterScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;
const mockPickUpload = jest.fn(async (_storage: unknown, _source: 'image' | 'pdf') => ({
  ok: true as const,
  value: {
    fileId: 'file-1',
    fileName: 'doc.jpg',
    mimeType: 'image/jpeg',
    size: 1000,
    sha256: 'a'.repeat(64),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
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

jest.mock('../services/media-service', () => ({
  pickPrepareUploadMedia: (storage: unknown, source: 'image' | 'pdf') =>
    mockPickUpload(storage, source),
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

describe('PartnerRegisterScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockPickUpload.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerRegisterScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('states the human-review rule and blocks an empty submission', async () => {
    await setup();
    expect(screen.getByTestId('register-review-note')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('register-error')).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('registers a partner and lands in pending verification', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('register-name'), 'Demo Hall');
    await fireEvent.changeText(
      screen.getByTestId('register-description'),
      'A demo venue for group weddings.',
    );
    await fireEvent.press(screen.getByTestId('register-governorate'));
    await fireEvent.changeText(screen.getByTestId('register-phone'), '0771234567');
    await fireEvent.press(screen.getByTestId('register-documents-pick-pdf'));
    await waitFor(() => {
      expect(mockPickUpload).toHaveBeenCalled();
    });
    await fireEvent.press(screen.getByTestId('register-terms'));
    await fireEvent.press(screen.getByTestId('register-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/partners/dashboard');
    });
    const listed = await container!.repositories.partners.list();
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.value.total).toBe(1);
      expect(listed.value.items[0]?.status).toBe('pending_verification');
    }
  });
});
