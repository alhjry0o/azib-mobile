import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { Switch } from '../Switch';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('Switch', () => {
  it('reports accessibility checked state', async () => {
    const { getByRole } = await render(<Switch value={true} onValueChange={() => {}} />, {
      wrapper: Providers,
    });
    expect(getByRole('switch').props.accessibilityState.checked).toBe(true);
  });

  it('calls onValueChange with inverted value on press', async () => {
    const onValueChange = jest.fn();
    const { getByRole } = await render(<Switch value={false} onValueChange={onValueChange} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('does not call onValueChange when disabled', async () => {
    const onValueChange = jest.fn();
    const { getByRole } = await render(
      <Switch value={false} onValueChange={onValueChange} disabled />,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders label when provided', async () => {
    const { getByText } = await render(
      <Switch value={false} onValueChange={() => {}} label="Notifications" />,
      { wrapper: Providers },
    );
    expect(getByText('Notifications')).toBeTruthy();
  });
});
