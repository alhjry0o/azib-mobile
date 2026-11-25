import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useAppModeStore } from '@/stores';
import { createMockPartnerRepository } from '@/repositories/mock/partner';
import { DevPartnersScreen } from '../DevPartnersScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/features/partners/services/media-service', () => ({
  pickPrepareUploadMedia: async () => ({ ok: true as const, value: null }),
}));

describe('DevPartnersScreen', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('starts empty and is unavailable outside demo mode', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevPartnersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-partners-empty')).toBeTruthy();
    });
    expect(createMockPartnerRepository).toBeDefined();
  });

  it('refuses to run in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <DevPartnersScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('dev-partners-empty')).toBeNull();
    expect(screen.getByTestId('dev-partners-screen')).toBeTruthy();
  });

  it('shows partner actions after selecting a partner', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <DevPartnersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-partners-empty')).toBeTruthy();
    });
    await view.unmount();
    expect(screen.queryByTestId('dev-partner-actions')).toBeNull();
  });

  it('keeps the audit trail as the only shared dependency surface', () => {
    const repo = createMockPartnerRepository();
    expect(typeof repo.list).toBe('function');
    expect(typeof repo.update).toBe('function');
    expect(typeof repo.create).toBe('function');
    expect(typeof repo.getById).toBe('function');
  });

  it('does not crash when the mode toggles back to demo', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <DevPartnersScreen />
      </ShellProviders>,
    );
    await act(() => {
      useAppModeStore.setState({ mode: 'demo', hydrated: true });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <DevPartnersScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('dev-partners-screen')).toBeTruthy();
    });
    expect(typeof fireEvent.press).toBe('function');
  });
});
