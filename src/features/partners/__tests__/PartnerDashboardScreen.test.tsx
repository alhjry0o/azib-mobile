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
import { createOfferDraft } from '../services/offer-lifecycle-service';
import { PartnerDashboardScreen } from '../screens/PartnerDashboardScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
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

const draft = {
  title: 'Demo hall discount',
  category: 'halls' as const,
  governorateId: 'sanaa',
  discountType: 'percent' as const,
  discountValue: 20,
  audience: 'beneficiaries' as const,
  products: ['Venue booking'],
  terms: null,
  validFrom: '2026-06-01T00:00:00.000Z',
  validUntil: '2026-07-01T00:00:00.000Z',
  imageFileIds: [],
};

describe('PartnerDashboardScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state before registration', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <PartnerDashboardScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-empty')).toBeTruthy();
    });
  });

  it('shows the partner status without a crown and lists a draft offer', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerDashboardScreen />
      </ShellProviders>,
    );
    let offerId = '';
    await act(async () => {
      const repos = container!.repositories;
      const deps = {
        partners: repos.partners,
        verifications: repos.partnerVerifications,
        offers: repos.offers,
        audit: repos.audit,
      };
      const partner = await registerPartner(deps, {
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
      });
      if (!partner.ok) throw new Error('setup failed');
      const offer = await createOfferDraft(deps, 'demo-user-test', partner.value.id, draft);
      if (offer.ok) offerId = offer.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerDashboardScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-partner')).toBeTruthy();
    });
    expect(screen.getByTestId('dashboard-not-verified')).toBeTruthy();
    expect(screen.queryByTestId('dashboard-crown')).toBeNull();
    expect(screen.getByTestId(`dashboard-offer-${offerId}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`dashboard-submit-${offerId}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`dashboard-submit-${offerId}`)).toBeNull();
    });
    const found = await container!.repositories.offers.getById(offerId);
    if (found.ok && found.value) expect(found.value.status).toBe('in_review');
  });
});
