import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAssistanceDraftStore } from '@/stores';
import { ProgramIntroScreen } from '../screens/ProgramIntroScreen';

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

describe('ProgramIntroScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAssistanceDraftStore.getState().reset();
    });
  });

  it('shows an honest empty state with no open program', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ProgramIntroScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('program-empty')).toBeTruthy();
    });
    expect(screen.getByTestId('program-policy-badge')).toBeTruthy();
  });

  it('lists open programs and starts the wizard with the chosen program', async () => {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <ProgramIntroScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      const created = await container!.repositories.programs.create({
        nameKey: 'assistance:program.title',
        descriptionKey: 'assistance:program.subtitle',
        minAmount: 1000,
        maxAmount: 2000,
      });
      if (created.ok) {
        id = created.value.id;
        await container!.repositories.programs.update(id, { status: 'open' });
      }
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId(`program-start-${id}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`program-start-${id}`));
    expect(useAssistanceDraftStore.getState().programId).toBe(id);
    expect(mockPush).toHaveBeenCalledWith('/assistance/new');
  });

  it('opens conditions and pre-check', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <ProgramIntroScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('program-open-conditions'));
    expect(mockPush).toHaveBeenCalledWith('/assistance/conditions');
    await fireEvent.press(screen.getByTestId('program-open-precheck'));
    expect(mockPush).toHaveBeenCalledWith('/assistance/pre-check');
  });
});
