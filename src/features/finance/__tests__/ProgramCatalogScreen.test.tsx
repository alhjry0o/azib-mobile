import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore } from '@/stores';
import { ProgramCatalogScreen } from '../screens/ProgramCatalogScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('ProgramCatalogScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
  });

  it('shows every program kind and an honest empty program list', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ProgramCatalogScreen />
      </ShellProviders>,
    );
    for (const kind of ['grant', 'partial', 'qard_hasan', 'in_kind', 'donor_contribution']) {
      expect(screen.getByTestId(`program-kind-${kind}`)).toBeTruthy();
    }
    await waitFor(() => {
      expect(screen.getByTestId('catalog-empty')).toBeTruthy();
    });
  });

  it('lists open programs and opens one', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <ProgramCatalogScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      const created = await container!.repositories.programs.create({
        nameKey: 'assistance:finance.catalog.title',
        descriptionKey: 'assistance:finance.catalog.subtitle',
        minAmount: 1000,
        maxAmount: 100000,
        kind: 'grant',
      });
      if (created.ok) {
        id = created.value.id;
        await container!.repositories.programs.update(id, { status: 'open' });
      }
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['finance'] });
    });
    await waitFor(() => {
      expect(screen.getByTestId(`catalog-open-${id}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`catalog-open-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/programs/${id}`);
  });

  it('opens a kind screen and the donor screens', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ProgramCatalogScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('program-kind-qard_hasan'));
    expect(mockPush).toHaveBeenCalledWith('/programs/kind/qard_hasan');
    await fireEvent.press(screen.getByTestId('catalog-open-donations'));
    expect(mockPush).toHaveBeenCalledWith('/programs/donations');
    await fireEvent.press(screen.getByTestId('catalog-open-receipts'));
    expect(mockPush).toHaveBeenCalledWith('/programs/receipts');
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ProgramCatalogScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('catalog-empty')).toBeNull();
    expect(screen.getByTestId('program-catalog-screen')).toBeTruthy();
  });
});
