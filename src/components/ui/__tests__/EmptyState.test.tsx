import { fireEvent, render } from '@testing-library/react-native';

import { i18n } from '@/i18n';
import { Providers } from './test-utils';
import { EmptyState } from '../EmptyState';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('EmptyState', () => {
  it('renders default title from i18n', async () => {
    const { getByText } = await render(<EmptyState />, { wrapper: Providers });
    expect(getByText(i18n.t('common.states.empty'))).toBeTruthy();
  });

  it('renders custom title and description', async () => {
    const { getByText } = await render(
      <EmptyState title="No items" description="Add your first item." />,
      { wrapper: Providers },
    );
    expect(getByText('No items')).toBeTruthy();
    expect(getByText('Add your first item.')).toBeTruthy();
  });

  it('renders action button when provided', async () => {
    const onAdd = jest.fn();
    const { getByText } = await render(
      <EmptyState title="Empty" action={{ label: 'Add', onPress: onAdd }} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action when provided', async () => {
    const onSecondary = jest.fn();
    const { getByText } = await render(
      <EmptyState
        title="Empty"
        secondaryAction={{ label: 'Learn more', onPress: onSecondary }}
      />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Learn more'));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('renders without action when not provided', async () => {
    const { queryByRole } = await render(<EmptyState title="Empty" />, { wrapper: Providers });
    expect(queryByRole('button')).toBeNull();
  });
});
