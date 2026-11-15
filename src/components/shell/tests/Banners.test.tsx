import NetInfo from '@react-native-community/netinfo';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { useAppModeStore, useShellStore } from '@/stores';
import { DemoBanner } from '../DemoBanner';
import { OfflineBanner } from '../OfflineBanner';

type Listener = (state: { isConnected: boolean | null }) => void;

describe('OfflineBanner', () => {
  let listener: Listener | null = null;

  beforeEach(async () => {
    listener = null;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb: Listener) => {
      listener = cb;
      return jest.fn();
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    await act(async () => {
      useShellStore.setState({ demoBannerDismissed: false });
      useAppModeStore.setState({ mode: 'demo', hydrated: true });
    });
  });

  it('appears only when connectivity is lost', async () => {
    render(
      <Providers>
        <OfflineBanner />
      </Providers>,
    );
    expect(screen.queryByTestId('offline-banner', { includeHiddenElements: true })).toBeNull();
    await act(async () => {
      listener?.({ isConnected: false });
    });
    expect(screen.getByTestId('offline-banner')).toBeTruthy();
    await act(async () => {
      listener?.({ isConnected: true });
    });
    expect(screen.queryByTestId('offline-banner', { includeHiddenElements: true })).toBeNull();
  });
});

describe('DemoBanner', () => {
  beforeEach(async () => {
    await act(async () => {
      useShellStore.setState({ demoBannerDismissed: false });
      useAppModeStore.setState({ mode: 'demo', hydrated: true });
    });
  });

  it('shows in demo mode and can be dismissed for the session', async () => {
    render(
      <Providers>
        <DemoBanner />
      </Providers>,
    );
    expect(screen.getByTestId('demo-banner')).toBeTruthy();
    fireEvent.press(screen.getByTestId('demo-banner-dismiss'));
    expect(screen.queryByTestId('demo-banner', { includeHiddenElements: true })).toBeNull();
  });

  it('never shows in backend mode', async () => {
    await act(async () => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    render(
      <Providers>
        <DemoBanner />
      </Providers>,
    );
    expect(screen.queryByTestId('demo-banner', { includeHiddenElements: true })).toBeNull();
  });
});
