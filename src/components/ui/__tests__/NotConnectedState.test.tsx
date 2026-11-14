import { fireEvent, render } from '@testing-library/react-native';

import { i18n } from '@/i18n';
import { Providers } from './test-utils';
import { NotConnectedState } from '../NotConnectedState';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('NotConnectedState', () => {
  it('renders default title from i18n', async () => {
    const { getByText } = await render(<NotConnectedState />, { wrapper: Providers });
    expect(getByText(i18n.t('errors.notConnected'))).toBeTruthy();
  });

  it('renders custom title and description', async () => {
    const { getByText } = await render(
      <NotConnectedState title="Not ready" description="Backend not configured." />,
      { wrapper: Providers },
    );
    expect(getByText('Not ready')).toBeTruthy();
    expect(getByText('Backend not configured.')).toBeTruthy();
  });

  it('renders retry button when onRetry provided', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<NotConnectedState onRetry={onRetry} />, {
      wrapper: Providers,
    });
    fireEvent.press(getByText(i18n.t('buttons.retry')));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action when provided', async () => {
    const onSecondary = jest.fn();
    const { getByText } = await render(
      <NotConnectedState
        secondaryAction={{ label: 'Learn more', onPress: onSecondary }}
      />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Learn more'));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('does not render retry when onRetry missing', async () => {
    const { queryByText } = await render(<NotConnectedState />, { wrapper: Providers });
    expect(queryByText(i18n.t('buttons.retry'))).toBeNull();
  });
});
