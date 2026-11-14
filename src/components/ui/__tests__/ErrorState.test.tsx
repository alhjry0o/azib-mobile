import { fireEvent, render } from '@testing-library/react-native';

import { i18n } from '@/i18n';
import { Providers } from './test-utils';
import { ErrorState } from '../ErrorState';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('ErrorState', () => {
  it('renders default title from i18n', async () => {
    const { getByText } = await render(<ErrorState />, { wrapper: Providers });
    expect(getByText(i18n.t('errors.unknown'))).toBeTruthy();
  });

  it('renders custom title and description', async () => {
    const { getByText } = await render(
      <ErrorState title="Failed" description="Could not load." />,
      { wrapper: Providers },
    );
    expect(getByText('Failed')).toBeTruthy();
    expect(getByText('Could not load.')).toBeTruthy();
  });

  it('renders retry button when onRetry provided', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(<ErrorState onRetry={onRetry} />, { wrapper: Providers });
    fireEvent.press(getByText(i18n.t('buttons.retry')));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when retrying', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = await render(<ErrorState onRetry={onRetry} retrying />, {
      wrapper: Providers,
    });
    // Button in loading state renders button-loading spinner
    expect(getByTestId('button-loading')).toBeTruthy();
  });

  it('does not render retry when onRetry missing', async () => {
    const { queryByText } = await render(<ErrorState title="Failed" />, { wrapper: Providers });
    expect(queryByText(i18n.t('buttons.retry'))).toBeNull();
  });
});
