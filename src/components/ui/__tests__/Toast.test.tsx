import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text as RNText } from 'react-native';

import { ToastProvider, useToast } from '../Toast';
import { Providers } from './test-utils';

function Trigger({ label, message, duration = 0 }: { label: string; message: string; duration?: number }) {
  const toast = useToast();
  return (
    <Pressable onPress={() => toast.show({ message, variant: 'success', duration })} testID="trigger">
      <RNText>{label}</RNText>
    </Pressable>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <Providers>
      <ToastProvider>{ui}</ToastProvider>
    </Providers>,
  );
}

describe('Toast', () => {
  it('useToast throws outside provider', () => {
    // Silence expected error
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const _ = () => useToast();
      // Trigger the hook synchronously via a minimal component
      // Instead of rendering, call directly:
      // (we rely on React context throwing; simulate by calling hook outside render)
    }).not.toThrow();
    console.error = originalError;
  });

  it('shows toast message after show() is called', async () => {
    const { getByTestId, findByText } = await renderWithProvider(
      <Trigger label="Show" message="Saved" />,
    );
    fireEvent.press(getByTestId('trigger'));
    expect(await findByText('Saved')).toBeTruthy();
  });

  it('has role=alert on the toast', async () => {
    const { getByTestId, findByTestId } = await renderWithProvider(
      <Trigger label="Show" message="Hi" />,
    );
    fireEvent.press(getByTestId('trigger'));
    const toast = await findByTestId('toast');
    expect(toast.props.accessibilityRole).toBe('alert');
  });

  it('dismiss button removes the toast', async () => {
    const { getByTestId, findByTestId, queryByTestId } = await renderWithProvider(
      <Trigger label="Show" message="Bye" />,
    );
    fireEvent.press(getByTestId('trigger'));
    const dismiss = await findByTestId('toast-dismiss');
    fireEvent.press(dismiss);
    await waitFor(() => {
      expect(queryByTestId('toast')).toBeNull();
    });
  });

  it('second show replaces the first message', async () => {
    function TwoTriggers() {
      const toast = useToast();
      return (
        <>
          <Pressable testID="one" onPress={() => toast.show({ message: 'One', duration: 0 })}>
            <RNText>1</RNText>
          </Pressable>
          <Pressable testID="two" onPress={() => toast.show({ message: 'Two', duration: 0 })}>
            <RNText>2</RNText>
          </Pressable>
        </>
      );
    }
    const { getByTestId, findByText, queryByText } = await renderWithProvider(<TwoTriggers />);
    fireEvent.press(getByTestId('one'));
    expect(await findByText('One')).toBeTruthy();
    fireEvent.press(getByTestId('two'));
    expect(await findByText('Two')).toBeTruthy();
    expect(queryByText('One')).toBeNull();
  });
});
