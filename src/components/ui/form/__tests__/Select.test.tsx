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
    const { getByTestId, findByText } = await render(
      <Select value={null} onChange={() => {}} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    
    // Await the modal content to appear
    expect(await findByText('Option A')).toBeTruthy();
    expect(await findByText('Option B')).toBeTruthy();
  });

  it('selects an option and calls onChange', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = await render(
      <Select value={null} onChange={onChange} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    const optionA = await findByText('Option A');
    fireEvent.press(optionA);
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

  it('does not select a disabled option', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = await render(
      <Select value={null} onChange={onChange} options={OPTIONS} placeholder="Pick" testID="sel" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('sel'));
    const optionC = await findByText('Option C (disabled)');
    fireEvent.press(optionC);
    expect(onChange).not.toHaveBeenCalled();
  });
});
