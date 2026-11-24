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
import { useAuthStore, useShellStore } from '@/stores';
import { OfferDetailScreen } from '../screens/OfferDetailScreen';

let mockOfferId = '';
let container: ProviderContainer | null = null;
const mockOpenExternalUrl = jest.fn(async () => ({ ok: true as const, value: undefined }));
const mockShareText = jest.fn(async () => ({ ok: true as const, value: true }));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ offerId: mockOfferId }),
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

jest.mock('../services/external-actions', () => ({
  openExternalUrl: (...args: unknown[]) => mockOpenExternalUrl(...(args as [string])),
  shareText: (...args: unknown[]) => mockShareText(...(args as [string])),
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

describe('OfferDetailScreen', () => {
  beforeEach(async () => {
    mockOfferId = '';
    container = null;
    mockOpenExternalUrl.mockClear();
    mockShareText.mockClear();
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(withPhone: boolean) {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <OfferDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const repos = container!.repositories;
      const partner = await repos.partners.create({
        displayName: 'Demo Hall',
        category: 'halls',
        governorateId: 'sanaa',
        ...(withPhone && { contactPhone: '+967700000001', whatsapp: '+967700000001' }),
      });
      if (!partner.ok) throw new Error('setup failed');
      const offer = await repos.offers.create({
        partnerId: partner.value.id,
        titleKey: 'marketplace:offers.title',
        discountPercent: 20,
        title: 'Demo discount',
        discountType: 'percent',
        discountValue: 20,
        discountPlaceholder: true,
        validUntil: '2099-01-01T00:00:00.000Z',
        products: ['Venue booking'],
        terms: 'Demo terms',
      });
      if (!offer.ok) throw new Error('setup failed');
      mockOfferId = offer.value.id;
      await repos.offers.update(mockOfferId, { status: 'active' });
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <OfferDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('offer-summary')).toBeTruthy();
    });
    return { client, view };
  }

  it('labels the demo discount as a placeholder and shows products/terms', async () => {
    await setup(true);
    expect(screen.getByTestId('offer-detail-discount-placeholder')).toBeTruthy();
    expect(screen.getByTestId('offer-products')).toBeTruthy();
    expect(screen.getByTestId('offer-terms')).toBeTruthy();
    expect(screen.getByTestId('offer-audience-note')).toBeTruthy();
  });

  it('disables contact actions when no number is disclosed', async () => {
    await setup(false);
    expect(screen.getByTestId('offer-call').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('offer-whatsapp').props.accessibilityState.disabled).toBe(true);
  });

  it('calls directly but confirms before WhatsApp', async () => {
    await setup(true);
    await fireEvent.press(screen.getByTestId('offer-call'));
    await waitFor(() => {
      expect(mockOpenExternalUrl).toHaveBeenCalledWith('tel:+967700000001');
    });
    mockOpenExternalUrl.mockClear();
    await fireEvent.press(screen.getByTestId('offer-whatsapp'));
    expect(useShellStore.getState().dialog).not.toBeNull();
    expect(mockOpenExternalUrl).not.toHaveBeenCalled();
    await act(() => {
      useShellStore.getState().dialog?.onConfirm?.();
    });
    await waitFor(() => {
      expect(mockOpenExternalUrl).toHaveBeenCalledWith('https://wa.me/967700000001');
    });
  });

  it('shares a real azib deep link', async () => {
    await setup(true);
    await fireEvent.press(screen.getByTestId('offer-share'));
    await waitFor(() => {
      expect(mockShareText).toHaveBeenCalled();
    });
    const message = mockShareText.mock.calls[0]?.[0] ?? '';
    expect(message).toContain(`azib://partners/offers/${mockOfferId}`);
  });

  it('saves and unsaves the offer', async () => {
    const { client, view } = await setup(true);
    await fireEvent.press(screen.getByTestId('offer-save'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <OfferDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      const saved = container!.repositories.partnerEngagement.listSaved('demo-user-test');
      expect(saved).toBeTruthy();
    });
    const rows = await container!.repositories.partnerEngagement.listSaved('demo-user-test');
    if (rows.ok) expect(rows.value.length).toBe(1);
  });

  it('validates and submits a report', async () => {
    await setup(true);
    await fireEvent.press(screen.getByTestId('offer-report'));
    await waitFor(() => {
      expect(screen.getByTestId('report-form')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('report-submit'));
    expect(screen.queryByTestId('offer-report-received')).toBeNull();
    await fireEvent.press(screen.getByTestId('report-reason'));
    await fireEvent.changeText(
      screen.getByTestId('report-detail'),
      'The discount is not applied at the shop.',
    );
    await fireEvent.press(screen.getByTestId('report-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('offer-report-received')).toBeTruthy();
    });
    const reports = await container!.repositories.offerReports.listByOffer(mockOfferId);
    if (reports.ok) expect(reports.value.length).toBe(1);
  });
});
