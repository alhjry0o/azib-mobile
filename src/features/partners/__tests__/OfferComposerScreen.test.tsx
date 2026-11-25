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
import { registerPartner } from '../services/registration-service';
import { OfferComposerScreen } from '../screens/OfferComposerScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
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
    options: readonly { value: string; label: string; disabled?: boolean }[];
    testID?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    const first = options.find((o) => !o.disabled);
    return (
      <Pressable testID={testID} onPress={() => first && onChange(first.value)}>
        <Text>{value ?? 'none'}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/components/ui/form/DatePicker', () => ({
  DatePicker: ({
    onChange,
    testID,
  }: {
    onChange: (d: Date | null) => void;
    testID?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    const value =
      testID === 'composer-valid-until'
        ? new Date('2026-07-01T00:00:00.000Z')
        : new Date('2026-06-01T00:00:00.000Z');
    return (
      <Pressable testID={testID} onPress={() => onChange(value)}>
        <Text>pick</Text>
      </Pressable>
    );
  },
}));

jest.mock('../services/media-service', () => ({
  pickPrepareUploadMedia: async () => ({ ok: true as const, value: null }),
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

describe('OfferComposerScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(withPartner: boolean) {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <OfferComposerScreen />
      </ShellProviders>,
    );
    if (withPartner) {
      await act(async () => {
        const repos = container!.repositories;
        await registerPartner(
          {
            partners: repos.partners,
            verifications: repos.partnerVerifications,
            audit: repos.audit,
          },
          {
            ownerId: 'demo-user-test',
            displayName: 'Demo Hall',
            category: 'halls',
            description: 'A demo venue for group weddings.',
            governorateId: 'sanaa',
            districtId: null,
            city: null,
            contactPhone: '0771234567',
            whatsapp: null,
            imageFileIds: [],
            documentFileIds: ['doc-1'],
            termsAccepted: true,
          },
        );
      });
      await act(async () => {
        await client.invalidateQueries({ queryKey: ['partners'] });
      });
      await view.rerender(
        <ShellProviders client={client}>
          <Probe />
          <OfferComposerScreen />
        </ShellProviders>,
      );
    }
    return { client, view };
  }

  it('warns honestly when no business is registered', async () => {
    await setup(false);
    await waitFor(() => {
      expect(screen.getByTestId('composer-no-partner')).toBeTruthy();
    });
    expect(screen.getByTestId('composer-save').props.accessibilityState.disabled).toBe(true);
  });

  it('saves a valid draft and returns to the dashboard', async () => {
    await setup(true);
    await waitFor(() => {
      expect(screen.queryByTestId('composer-no-partner')).toBeNull();
    });
    await fireEvent.changeText(screen.getByTestId('composer-title'), 'Demo hall discount');
    await fireEvent.press(screen.getByTestId('composer-governorate'));
    await fireEvent.changeText(screen.getByTestId('composer-discount-value'), '20');
    await fireEvent.press(screen.getByTestId('composer-valid-from'));
    await fireEvent.press(screen.getByTestId('composer-valid-until'));
    await fireEvent.press(screen.getByTestId('composer-save'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/partners/dashboard');
    });
    const listed = await container!.repositories.offers.list();
    if (listed.ok) expect(listed.value.total).toBe(1);
  });
});
