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
import { SoukItemComposerScreen } from '../screens/SoukItemComposerScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;
const mockPickUpload = jest.fn(async (_storage: unknown) => ({
  ok: true as const,
  value: { fileId: 'file-1', fingerprint: 'fp-1' },
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
  pickPrepareUploadSoukImage: (storage: unknown) => mockPickUpload(storage),
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

describe('SoukItemComposerScreen', () => {
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
        <SoukItemComposerScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('states the no-price rule and blocks an empty submission', async () => {
    await setup();
    expect(screen.getByTestId('souk-composer-no-price')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('souk-composer-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-composer-error')).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uploads an image and publishes a valid donation', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('souk-composer-title'), 'Bedroom set');
    await fireEvent.changeText(
      screen.getByTestId('souk-composer-description'),
      'A gently used bedroom set offered as an in-kind donation.',
    );
    await fireEvent.press(screen.getByTestId('souk-composer-governorate'));
    await fireEvent.press(screen.getByTestId('souk-composer-add-image'));
    await waitFor(() => {
      expect(mockPickUpload).toHaveBeenCalled();
    });
    await fireEvent.press(screen.getByTestId('souk-composer-no-resale'));
    await fireEvent.press(screen.getByTestId('souk-composer-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/souk/mine');
    });
    const listed = await container!.repositories.souk.list();
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.value.total).toBe(1);
      expect(listed.value.items[0]?.status).toBe('available');
    }
  });

  it('refuses a description that contains a contact number', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('souk-composer-title'), 'Bedroom set');
    await fireEvent.changeText(
      screen.getByTestId('souk-composer-description'),
      'Call me on 771234567 to arrange the pickup of this set.',
    );
    await fireEvent.press(screen.getByTestId('souk-composer-governorate'));
    await fireEvent.press(screen.getByTestId('souk-composer-no-resale'));
    await fireEvent.press(screen.getByTestId('souk-composer-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('souk-composer-error')).toBeTruthy();
    });
    const listed = await container!.repositories.souk.list();
    if (listed.ok) expect(listed.value.total).toBe(0);
  });
});
