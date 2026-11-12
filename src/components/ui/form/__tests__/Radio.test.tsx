import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { RadioGroup } from '../Radio';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

const OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
];

describe('RadioGroup', () => {
  it('renders all options with radio role', async () => {
    const { getAllByRole } = await render(
      <RadioGroup options={OPTIONS} value={null} onValueChange={() => {}} />,
      { wrapper: Providers },
    );
    expect(getAllByRole('radio').length).toBe(2);
  });

  it('marks the selected option', async () => {
    const { getAllByRole } = await render(
      <RadioGroup options={OPTIONS} value="female" onValueChange={() => {}} />,
      { wrapper: Providers },
    );
    const radios = getAllByRole('radio');
    expect(radios[0]?.props.accessibilityState.selected).toBe(false);
    expect(radios[1]?.props.accessibilityState.selected).toBe(true);
  });

  it('calls onValueChange on press', async () => {
    const onChange = jest.fn();
    const { getAllByRole } = await render(
      <RadioGroup options={OPTIONS} value={null} onValueChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getAllByRole('radio')[0]!);
    expect(onChange).toHaveBeenCalledWith('male');
  });

  it('skips disabled options', async () => {
    const onChange = jest.fn();
    const { getAllByRole } = await render(
      <RadioGroup
        options={[
          { value: 'a', label: 'A', disabled: true },
          { value: 'b', label: 'B' },
        ]}
        value={null}
        onValueChange={onChange}
      />,
      { wrapper: Providers },
    );
    fireEvent.press(getAllByRole('radio')[0]!);
    expect(onChange).not.toHaveBeenCalled();
  });
});
