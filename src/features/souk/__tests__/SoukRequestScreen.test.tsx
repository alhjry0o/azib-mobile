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
import { createItemDraft, submitItemForPublication } from '../services/item-service';
import { DEFAULT_SOUK_LIMITS } from '../state/limits';
import { SoukRequestScreen } from '../screens/SoukRequestScreen';

const mockReplace = jest.fn();
let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
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

describe('SoukRequestScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
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
        <SoukRequestScreen />
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
          estimatedValue: null,
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
        <SoukRequestScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('requires a meaningful reason', async () => {
    await setup();
    expect(screen.getByTestId('souk-request-limit-note')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('souk-request-reason'), 'need');
    await fireEvent.press(screen.getByTestId('souk-request-submit'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('submits a valid request', async () => {
    await setup();
    await fireEvent.changeText(
      screen.getByTestId('souk-request-reason'),
      'Setting up a new home for a young family.',
    );
    await fireEvent.press(screen.getByTestId('souk-request-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/souk/requests');
    });
    const listed = await container!.repositories.soukRequests.listByRequester('demo-user-test');
    expect(listed.ok).toBe(true);
    if (listed.ok) expect(listed.value.length).toBe(1);
  });
});
