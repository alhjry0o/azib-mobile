import { fireEvent, render } from '@testing-library/react-native';

import { Banner } from '../Banner';
import { Providers } from './test-utils';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('Banner', () => {
  it('renders message and title', async () => {
    const { getByText } = await render(
      <Banner title="Heads up" message="Body text" />,
      { wrapper: Providers },
    );
    expect(getByText('Heads up')).toBeTruthy();
    expect(getByText('Body text')).toBeTruthy();
  });

  it('has role=alert', async () => {
    const { getByTestId } = await render(<Banner message="Info" testID="banner" />, {
      wrapper: Providers,
    });
    // Instead of getByRole which requires accessible={true}, we check the prop directly.
    const el = getByTestId('banner');
    expect(el.props.accessibilityRole).toBe('alert');
  });

  it('renders dismiss button when onDismiss provided', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await render(
      <Banner message="Dismiss me" onDismiss={onDismiss} testID="banner" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('banner-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss when onDismiss missing', async () => {
    const { queryByTestId } = await render(<Banner message="No dismiss" testID="banner" />, {
      wrapper: Providers,
    });
    expect(queryByTestId('banner-dismiss')).toBeNull();
  });

  it('renders action button when provided', async () => {
    const onAction = jest.fn();
    const { getByText } = await render(
      <Banner message="Action here" actionLabel="Retry" onAction={onAction} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Retry'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('supports demo variant', async () => {
    const { getByText } = await render(<Banner variant="demo" message="Demo data" />, {
      wrapper: Providers,
    });
    expect(getByText('Demo data')).toBeTruthy();
  });
});
