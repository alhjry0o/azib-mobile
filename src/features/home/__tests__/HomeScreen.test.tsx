import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useAuthStore, useSettingsStore, useShellStore } from '@/stores';
import { HomeScreen } from '../HomeScreen';

const mockNavigate = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush, replace: jest.fn() }),
}));

function clientWithSession(roles?: readonly string[]) {
  const client = createTestQueryClient();
  const session = makeDemoSession();
  client.setQueryData(sessionQueryKey('demo'), {
    ok: true,
    value: roles ? { ...session, user: { ...session.user, roles } } : session,
  });
  return client;
}

describe('HomeScreen', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    mockPush.mockClear();
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: true, hydrated: true, challenge: null });
      useSettingsStore.setState({
        homeSectionOrder: [],
        homeSectionVisibility: {},
        homeQuickActionVisibility: {},
        hydrated: true,
      });
      useShellStore.setState({ unreadNotifications: 0 });
    });
  });

  it('renders the header, hero, quick actions and the demo notice for a guest', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('home-greeting')).toBeTruthy();
    expect(screen.getByTestId('home-hero')).toBeTruthy();
    expect(screen.getByTestId('home-quick-actions')).toBeTruthy();
    expect(screen.getByTestId('home-demo-badge')).toBeTruthy();
    expect(screen.getByTestId('home-demo-notice')).toBeTruthy();
    expect(screen.queryByTestId('role-staff')).toBeNull();
  });

  it('shows the unread badge and opens search and notifications', async () => {
    await act(() => {
      useShellStore.setState({ unreadNotifications: 4 });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('home-notifications-badge')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('home-search'));
    expect(mockPush).toHaveBeenCalledWith('/(features)/search');
    await fireEvent.press(screen.getByTestId('home-notifications'));
    expect(mockPush).toHaveBeenCalledWith('/(features)/notifications');
  });

  it('routes quick actions and the hero buttons to real destinations', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('quick-action-souk'));
    expect(mockNavigate).toHaveBeenCalledWith('/(features)/souk');
    await fireEvent.press(screen.getByTestId('hero-primary'));
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/weddings');
    await fireEvent.press(screen.getByTestId('hero-secondary'));
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/services');
  });

  it('switches the hero primary action for an applicant', async () => {
    await render(
      <ShellProviders client={clientWithSession(['member', 'applicant'])}>
        <HomeScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('hero-primary'));
    expect(mockNavigate).toHaveBeenCalledWith('/assistance');
  });

  it('shows role blocks only for the matching roles', async () => {
    await render(
      <ShellProviders client={clientWithSession(['member', 'partner_owner', 'volunteer', 'reviewer'])}>
        <HomeScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('role-partner')).toBeTruthy();
    expect(screen.getByTestId('section-volunteer')).toBeTruthy();
    expect(screen.getByTestId('role-staff')).toBeTruthy();
  });

  it('opens the customize sheet from the header', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeScreen />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('home-customize'));
    expect(useShellStore.getState().sheet).not.toBeNull();
  });

  it('pull-to-refresh invalidates the home queries', async () => {
    const client = clientWithSession();
    const spy = jest.spyOn(client, 'invalidateQueries');
    await render(
      <ShellProviders client={client}>
        <HomeScreen />
      </ShellProviders>,
    );
    await fireEvent(screen.getByTestId('home-list'), 'refresh');
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({ queryKey: ['home'] });
    });
    spy.mockRestore();
  });

  it('mounts the first sections and keeps hidden ones out of the list', async () => {
    await act(() => {
      useSettingsStore.setState({ homeSectionVisibility: { weddings: false } });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <HomeScreen />
      </ShellProviders>,
    );
    await waitFor(
      () => {
        expect(screen.getByTestId('section-offers')).toBeTruthy();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByTestId('section-weddings', { includeHiddenElements: true })).toBeNull();
  });
});
