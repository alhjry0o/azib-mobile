import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { Checkbox } from '../Checkbox';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('Checkbox', () => {
  it('reports checked state', async () => {
    const { getByRole } = await render(
      <Checkbox checked={true} onCheckedChange={() => {}} label="Accept" />,
      { wrapper: Providers },
    );
    expect(getByRole('checkbox').props.accessibilityState.checked).toBe(true);
  });

  it('reports mixed state when indeterminate', async () => {
    const { getByRole } = await render(
      <Checkbox checked={false} indeterminate onCheckedChange={() => {}} />,
      { wrapper: Providers },
    );
    expect(getByRole('checkbox').props.accessibilityState.checked).toBe('mixed');
  });

  it('calls onCheckedChange with inverted value on press', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(
      <Checkbox checked={false} onCheckedChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not fire when disabled', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(
      <Checkbox checked={false} disabled onCheckedChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
