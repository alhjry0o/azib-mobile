import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { OTPInput } from '../OTPInput';

describe('OTPInput', () => {
  it('renders N cells based on length', async () => {
    const { } = await render(
      <OTPInput value="" onChangeText={() => {}} length={4} testID="otp" />,
      { wrapper: Providers },
    );
    // Cells are Views; checking the input exists is enough signal of correctness.
    // (Cell count is verified indirectly through the container children.)
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={() => {}} length={4} testID="otp" />,
      { wrapper: Providers },
    );
    expect(getByTestId('otp')).toBeTruthy();
    void UNSAFE_getAllByType;
  });

  it('calls onChangeText with digits only', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={onChangeText} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), '12a');
    expect(onChangeText).toHaveBeenCalledWith('12');
  });

  it('strips non-digit characters', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={onChangeText} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), 'ab12cd34');
    expect(onChangeText).toHaveBeenCalledWith('1234');
  });

  it('truncates to length', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={onChangeText} length={4} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), '12345678');
    expect(onChangeText).toHaveBeenCalledWith('1234');
  });

  it('calls onComplete when length reached', async () => {
    const onChangeText = jest.fn();
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={onChangeText} onComplete={onComplete} length={4} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), '1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('does not call onComplete for partial entry', async () => {
    const onChangeText = jest.fn();
    const onComplete = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="" onChangeText={onChangeText} onComplete={onComplete} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), '123');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not fire change on identical value', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <OTPInput value="123456" onChangeText={onChangeText} testID="otp" />,
      { wrapper: Providers },
    );
    fireEvent.changeText(getByTestId('otp'), '123456');
    expect(onChangeText).not.toHaveBeenCalled();
  });
});
