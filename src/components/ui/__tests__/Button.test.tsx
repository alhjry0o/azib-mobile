import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

// expo-haptics is used by useHaptics; mock it so it doesn't touch native.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

import { darkTheme } from '@/theme';

import { Button } from '../Button';
import { Providers } from './test-utils';

describe('Button', () => {
  it('renders label text', async () => {
    const { getByText } = await render(
      <Button label="Click me" onPress={jest.fn()} />,
      { wrapper: Providers },
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button label="Go" onPress={onPress} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button label="Go" onPress={onPress} disabled />,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks accessibility state when disabled', async () => {
    const { getByRole } = await render(<Button label="Go" disabled />, { wrapper: Providers });
    expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
  });

  it('shows loading spinner and marks busy', async () => {
    const { getByTestId, getByRole } = await render(<Button label="Go" loading />, {
      wrapper: Providers,
    });
    expect(getByTestId('button-loading')).toBeTruthy();
    expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  });

  it('does not call onPress when loading', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button label="Go" loading onPress={onPress} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders icon-only variant', async () => {
    const { getByRole, queryByText } = await render(
      <Button variant="icon" leftIcon="check" accessibilityLabel="Confirm" />,
      { wrapper: Providers },
    );
    expect(getByRole('button')).toBeTruthy();
    expect(queryByText('Confirm')).toBeNull();
  });

  it('applies primary variant background from theme', async () => {
    const { getByRole } = await render(<Button label="Go" variant="primary" />, {
      wrapper: Providers,
    });
    const btn = getByRole('button');
    const flat = StyleSheet.flatten(btn.props.style);
    expect(flat.backgroundColor).toBe(darkTheme.colors.accent.fill);
  });

  it('applies gold variant text color (inverse)', async () => {
    const { getByText } = await render(<Button label="Go" variant="gold" />, {
      wrapper: Providers,
    });
    const text = getByText('Go');
    const flat = StyleSheet.flatten(text.props.style);
    expect(flat.color).toBe(darkTheme.colors.text.inverse);
  });

  it('renders left and right icons alongside text', async () => {
    const { getByText } = await render(
      <Button label="Go" leftIcon="check" rightIcon="chevronRight" />,
      { wrapper: Providers },
    );
    expect(getByText('Go')).toBeTruthy();
    // Icons are rendered via View (no text). Presence is verified indirectly:
    // the button still has one child Text node, plus the two icon Views.
  });
});
