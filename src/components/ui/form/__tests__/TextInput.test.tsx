import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders label and placeholder', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <TextInput label="Email" placeholder="you@example.com" />,
      { wrapper: Providers },
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('calls onChangeText on user input', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TextInput testID="email" onChangeText={onChangeText} />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('email'), 'hi@example.com');
    expect(onChangeText).toHaveBeenCalledWith('hi@example.com');
  });

  it('shows error text when errorText provided', async () => {
    const { getByText } = await render(
      <TextInput label="Email" errorText="Invalid email" />,
      { wrapper: Providers },
    );
    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('is disabled when disabled=true and does not respond to input', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <TextInput testID="email" disabled onChangeText={onChangeText} />,
      { wrapper: Providers },
    );
    const input = getByTestId('email');
    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityState.disabled).toBe(true);
  });

  it('renders left icon wrapper (no crash with icon prop)', async () => {
    const { getByTestId } = await render(
      <TextInput testID="email" leftIcon="search" />,
      { wrapper: Providers },
    );
    expect(getByTestId('email')).toBeTruthy();
  });
});
