import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useOnboardingStore } from '@/stores';
import { TabsShell } from '../TabsShell';
import { sessionQueryKey } from '../use-session';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from './test-utils';

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  Tabs: Object.assign(
    ({ children }: { children?: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View } = require('react-native');
      return <View testID="mock-tabs">{children as never}</View>;
    },
    { Screen: () => null },
  ),
  useRouter: () => ({ navigate: mockNavigate, replace: jest.fn(), push: jest.fn() }),
  usePathname: () => '/',
}));

describe('TabsShell', () => {
  beforeEach(async () => {
    await resetShellStores();
  });

  it('redirects to onboarding when it is not completed', async () => {
    render(
      <ShellProviders>
        <TabsShell />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(onboarding)')).toBeTruthy();
    });
  });

  it('redirects to sign-in when completed but signed out', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
    render(
      <ShellProviders>
        <TabsShell />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('redirect:/(auth)/sign-in')).toBeTruthy();
    });
  });

  it('renders the tabs and the floating dock when ready', async () => {
    await act(async () => {
      useOnboardingStore.setState({ completed: true, hydrated: true });
    });
    const client = createTestQueryClient();
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    render(
      <ShellProviders client={client}>
        <TabsShell />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('floating-dock')).toBeTruthy();
    });
    expect(screen.getByTestId('mock-tabs')).toBeTruthy();
  });
});
