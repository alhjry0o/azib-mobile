import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { Chip } from '../Chip';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('Chip', () => {
  it('renders label without press when onPress is not provided', async () => {
    const { getByText, queryByRole } = await render(<Chip label="Static" />, {
      wrapper: Providers,
    });
    expect(getByText('Static')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
  });

  it('is interactive when onPress is provided', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Chip label="Tap" onPress={onPress} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports selected state via accessibility', async () => {
    const { getByRole } = await render(<Chip label="On" selected onPress={() => {}} />, {
      wrapper: Providers,
    });
    expect(getByRole('button').props.accessibilityState.selected).toBe(true);
  });

  it('does not fire when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Chip label="Off" disabled onPress={onPress} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
