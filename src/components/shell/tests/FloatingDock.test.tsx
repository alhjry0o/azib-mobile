import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { setLanguage } from '@/i18n';
import { useShellStore } from '@/stores';
import { FloatingDock } from '../FloatingDock';

const mockNavigate = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, replace: jest.fn(), push: jest.fn() }),
  usePathname: () => mockPathname,
}));

function renderDock() {
  return render(
    <Providers>
      <FloatingDock />
    </Providers>,
  );
}

describe('FloatingDock', () => {
  beforeEach(async () => {
    mockNavigate.mockClear();
    mockPathname = '/';
    await act(async () => {
      useShellStore.setState({ unreadNotifications: 0 });
      await setLanguage('ar');
    });
  });

  afterEach(async () => {
    await act(async () => {
      await setLanguage('ar');
    });
    jest.restoreAllMocks();
  });

  it('renders five tabs including the emphasized center', () => {
    renderDock();
    for (const key of ['home', 'services', 'weddings', 'partners', 'account']) {
      expect(screen.getByTestId(`dock-item-${key}`)).toBeTruthy();
    }
  });

  it('orders items RTL-first in Arabic (home rightmost) and LTR in English', async () => {
    renderDock();
    const row = screen.getByTestId('dock-items');
    expect(StyleSheet.flatten(row.props.style).flexDirection).toBe('row-reverse');
    await act(async () => {
      await setLanguage('en');
    });
    expect(StyleSheet.flatten(row.props.style).flexDirection).toBe('row');
  });

  it('navigates to the pressed tab route', () => {
    renderDock();
    fireEvent.press(screen.getByTestId('dock-item-services'));
    expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/services');
  });

  it('marks the active tab from the current pathname', () => {
    mockPathname = '/services';
    renderDock();
    expect(screen.getByTestId('dock-item-services').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('dock-item-home').props.accessibilityState.selected).toBe(false);
  });

  it('shows the unread badge only when the count is positive', async () => {
    renderDock();
    expect(screen.queryByTestId('dock-badge', { includeHiddenElements: true })).toBeNull();
    await act(async () => {
      useShellStore.getState().setUnreadNotifications(3);
    });
    expect(screen.getByTestId('dock-badge')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('hides while the keyboard is open and returns when it closes', () => {
    const listeners = new Map<string, () => void>();
    jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation(((event: string, handler: () => void) => {
        listeners.set(event, handler);
        return { remove: jest.fn() };
      }) as unknown as typeof Keyboard.addListener);

    renderDock();
    expect(screen.getByTestId('floating-dock')).toBeTruthy();

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    act(() => {
      listeners.get(showEvent)?.();
    });
    expect(screen.queryByTestId('floating-dock', { includeHiddenElements: true })).toBeNull();

    act(() => {
      listeners.get(hideEvent)?.();
    });
    expect(screen.getByTestId('floating-dock')).toBeTruthy();
  });
});
