import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore } from '@/stores';
import { PartnerBrowserScreen } from '../screens/PartnerBrowserScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/components/ui/form/Select', () => ({
  Select: () => null,
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

async function seedPartner(name: string, category: string): Promise<string> {
  const created = await container!.repositories.partners.create({
    displayName: name,
    category,
    governorateId: 'sanaa',
  });
  if (!created.ok) throw new Error('setup failed');
  return created.value.id;
}

describe('PartnerBrowserScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
  });

  it('shows an honest empty state and the crown note', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('partners-crown-note')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('partners-empty')).toBeTruthy();
    });
  });

  it('lists a partner without a crown and opens the profile', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedPartner('Demo Hall', 'halls');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`partner-card-${id}`)).toBeTruthy();
    });
    expect(screen.queryByTestId(`partner-crown-${id}`)).toBeNull();
    await fireEvent.press(screen.getByTestId(`partner-open-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/partners/${id}`);
  });

  it('grants the crown only after a verified record exists', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedPartner('Verified Hall', 'halls');
      const repos = container!.repositories;
      // A forged status field alone must NOT produce a crown.
      await repos.partners.update(id, { status: 'verified' });
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`partner-card-${id}`)).toBeTruthy();
    });
    expect(screen.queryByTestId(`partner-crown-${id}`)).toBeNull();

    await act(async () => {
      const repos = container!.repositories;
      const submitted = await repos.partnerVerifications.submit({
        partnerId: id,
        submittedBy: 'owner-1',
        documentFileIds: ['file-1'],
      });
      if (submitted.ok) {
        await repos.partnerVerifications.decide(submitted.value.id, {
          decision: 'verified',
          decidedBy: 'verifier-1',
          validUntil: '2099-01-01T00:00:00.000Z',
        });
      }
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`partner-crown-${id}`)).toBeTruthy();
    });
  });

  it('filters by category and clears the filters', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await seedPartner('Demo Hall', 'halls');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('category-gold')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('category-gold'));
    await waitFor(() => {
      expect(screen.getByTestId('partners-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('partners-clear-filters'));
    await waitFor(() => {
      expect(screen.queryByTestId('partners-empty')).toBeNull();
    });
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <PartnerBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('partners-search')).toBeNull();
    expect(screen.getByTestId('partners-screen')).toBeTruthy();
  });
});
