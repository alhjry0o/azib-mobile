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
import { createItemDraft } from '../services/item-service';
import { resolveSoukLimits } from '../state/limits';
import { SoukMyItemsScreen } from '../screens/SoukMyItemsScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
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

describe('SoukMyItemsScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state with the gift illustration', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <SoukMyItemsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('souk-mine-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('souk-mine-empty-gift')).toBeTruthy();
  });

  it('publishes a draft through review when settings require it', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <SoukMyItemsScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      const repos = container!.repositories;
      await repos.settings.update('system_settings', { soukRequireItemReview: true });
      const created = await createItemDraft(
        { souk: repos.souk, audit: repos.audit },
        {
          donorId: 'demo-user-test',
          title: 'Bedroom set',
          category: 'furniture',
          condition: 'good',
          description: 'A gently used bedroom set offered as an in-kind donation.',
          governorateId: 'sanaa',
          districtId: null,
          deliveryMethod: 'self_pickup',
          imageFileIds: [],
          imageFingerprints: [],
          estimatedValue: null,
          noResaleConsent: true,
        },
        resolveSoukLimits({ soukRequireItemReview: true }),
        new Date(),
      );
      if (created.ok) id = created.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['souk'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <SoukMyItemsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`souk-mine-${id}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`souk-mine-publish-${id}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`souk-mine-publish-${id}`)).toBeNull();
    });
    const found = await container!.repositories.souk.getById(id);
    if (found.ok && found.value) expect(found.value.status).toBe('pending_review');
  });
});
