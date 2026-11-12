import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { Card } from '../Card';
import { Providers } from './test-utils';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('Card', () => {
  it('flat renders children', async () => {
    const { getByText } = await render(
      <Card>
        <RNText>Flat content</RNText>
      </Card>,
      { wrapper: Providers },
    );
    expect(getByText('Flat content')).toBeTruthy();
  });

  it('crest renders children', async () => {
    const { getByText } = await render(
      <Card variant="crest">
        <RNText>Crest content</RNText>
      </Card>,
      { wrapper: Providers },
    );
    expect(getByText('Crest content')).toBeTruthy();
  });

  it('pressable fires onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Card variant="pressable" onPress={onPress} accessibilityLabel="Open">
        <RNText>Press me</RNText>
      </Card>,
      { wrapper: Providers },
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('stat renders title and value', async () => {
    const { getByText } = await render(
      <Card variant="stat" title="Total donations" value={1250} />,
      { wrapper: Providers },
    );
    expect(getByText('Total donations')).toBeTruthy();
    expect(getByText('1250')).toBeTruthy();
  });

  it('stat renders caption when provided', async () => {
    const { getByText } = await render(
      <Card variant="stat" title="Applications" value="42" caption="this month" />,
      { wrapper: Providers },
    );
    expect(getByText('this month')).toBeTruthy();
  });
});
