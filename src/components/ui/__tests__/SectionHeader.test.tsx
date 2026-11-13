import { fireEvent, render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { SectionHeader } from '../SectionHeader';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('SectionHeader', () => {
  it('renders title', async () => {
    const { getByText } = await render(<SectionHeader title="Recent" />, {
      wrapper: Providers,
    });
    expect(getByText('Recent')).toBeTruthy();
  });

  it('renders subtitle when provided', async () => {
    const { getByText } = await render(
      <SectionHeader title="Recent" subtitle="Last 30 days" />,
      { wrapper: Providers },
    );
    expect(getByText('Last 30 days')).toBeTruthy();
  });

  it('does not render action when onAction missing', async () => {
    const { queryByTestId } = await render(
      <SectionHeader title="Recent" actionLabel="See all" testID="sh" />,
      { wrapper: Providers },
    );
    expect(queryByTestId('sh-action')).toBeNull();
  });

  it('renders action button when both provided', async () => {
    const onAction = jest.fn();
    const { getByTestId, getByText } = await render(
      <SectionHeader
        title="Recent"
        actionLabel="See all"
        onAction={onAction}
        testID="sh"
      />,
      { wrapper: Providers },
    );
    expect(getByText('See all')).toBeTruthy();
    fireEvent.press(getByTestId('sh-action'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
