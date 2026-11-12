import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { Select } from '../Select';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

const OPTIONS = [
  { value: 'a' as const, label: 'Option A' },
  { value: 'b' as const, label: 'Option B' },
  { value: 'c' as const, label: 'Option C (disabled)', disabled: true },
];

describe('Select', () => {
  it('shows placeholder when no value', async () => {
    const { getByText } = await render(
      <Select value={null} onChange={() => {}} options={OPTIONS} placeholder="Choose one" />,
      { wrapper: Providers },
    );
    expect(getByText('Choose one')).toBeTruthy();
  });

  it('shows selected option label', async () => {
    const { getByText } = await render(
      <Select value="b" onChange={() => {}} options={OPTIONS} />,
      { wrapper: Providers },
    );
    expect(getByText('Option B')).toBeTruthy();
  });

  it('opens modal on press and lists options', async () => {
    const { getByTestId, getByText } = await render(
      <Select value={null} onChange={() => {}} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    // Modal content now rendered
    expect(getByText('Option A')).toBeTruthy();
    expect(getByText('Option B')).toBeTruthy();
  });

  it('selects an option and calls onChange', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <Select value={null} onChange={onChange} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    fireEvent.press(getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('does not open when disabled', async () => {
    const { getByTestId, queryByText } = await render(
      <Select value={null} onChange={() => {}} options={OPTIONS} disabled testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    expect(queryByText('Option A')).toBeNull();
  });

  it('does not open when there are no options', async () => {
    const { getByTestId, queryByText } = await render(
      <Select value={null} onChange={() => {}} options={[]} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    expect(queryByText('Pick')).toBeTruthy(); // trigger
    // Options never shown
  });

  it('does not select a disabled option', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <Select value={null} onChange={onChange} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    fireEvent.press(getByText('Option C (disabled)'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
