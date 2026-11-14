import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { Providers } from './test-utils';
import { ListItem } from '../ListItem';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('ListItem', () => {
  it('renders title and subtitle', async () => {
    const { getByText } = await render(<ListItem title="Account" subtitle="Manage" />, {
      wrapper: Providers,
    });
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Manage')).toBeTruthy();
  });

  it('renders leading and trailing', async () => {
    const { getByText } = await render(
      <ListItem
        title="Row"
        leading={<RNText>LEAD</RNText>}
        trailing={<RNText>TRAIL</RNText>}
      />,
      { wrapper: Providers },
    );
    expect(getByText('LEAD')).toBeTruthy();
    expect(getByText('TRAIL')).toBeTruthy();
  });

  it('calls onPress when interactive', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<ListItem title="Tap" onPress={onPress} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <ListItem title="Tap" onPress={onPress} disabled />,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is not a button when onPress is missing', async () => {
    const { queryByRole } = await render(<ListItem title="Static" />, { wrapper: Providers });
    expect(queryByRole('button')).toBeNull();
  });

  it('applies destructive color to title when destructive=true (no crash)', async () => {
    const { getByText } = await render(<ListItem title="Delete" destructive />, {
      wrapper: Providers,
    });
    expect(getByText('Delete')).toBeTruthy();
  });

  it('card variant renders without crash', async () => {
    const { getByTestId } = await render(<ListItem title="Card row" variant="card" testID="li" />, {
      wrapper: Providers,
    });
    expect(getByTestId('li')).toBeTruthy();
  });
});
