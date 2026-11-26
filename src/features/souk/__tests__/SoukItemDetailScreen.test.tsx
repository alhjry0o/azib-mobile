import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { createItemDraft, submitItemForPublication } from '../services/item-service';
import { DEFAULT_SOUK_LIMITS } from '../state/limits';
import { SoukItemDetailScreen } from '../screens/SoukItemDetailScreen';

let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
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

describe('SoukItemDetailScreen', () => {
  beforeEach(async () => {
    mockId = '';
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
        <SoukItemDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const deps = {
        souk: container!.repositories.souk,
        audit: container!.repositories.audit,
      };
      const now = new Date();
      const created = await createItemDraft(
        deps,
        {
          donorId: 'donor-1',
          title: 'Bedroom set',
          category: 'furniture',
          condition: 'good',
          description: 'A gently used bedroom set offered as an in-kind donation.',
          governorateId: 'sanaa',
          districtId: null,
          deliveryMethod: 'self_pickup',
          imageFileIds: [],
          imageFingerprints: [],
          estimatedValue: 25000,
          noResaleConsent: true,
        },
        DEFAULT_SOUK_LIMITS,
        now,
      );
      if (!created.ok) throw new Error('setup failed');
      mockId = created.value.id;
      await submitItemForPublication(deps, mockId, 'donor-1', DEFAULT_SOUK_LIMITS, now);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukItemDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-detail-card')).toBeTruthy();
    });
    return { client, view };
  }

  it('shows the public projection with privacy and no-resale notes', async () => {
    await setup();
    expect(screen.getByTestId('souk-detail-privacy')).toBeTruthy();
    expect(screen.getByTestId('souk-detail-no-resale')).toBeTruthy();
    expect(screen.getByTestId('souk-detail-area')).toBeTruthy();
    expect(screen.getByTestId('souk-detail-description')).toBeTruthy();
    expect(screen.queryByText('25000')).toBeNull();
    expect(screen.queryByText('donor-1')).toBeNull();
  });

  it('offers a request action to a non-owner', async () => {
    await setup();
    expect(screen.getByTestId('souk-detail-request')).toBeTruthy();
  });

  it('shows a missing state for an unknown id', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukItemDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = 'does-not-exist';
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukItemDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-detail-missing')).toBeTruthy();
    });
  });
});
