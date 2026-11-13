import { fireEvent, render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { Dialog } from '../Dialog';
import { Providers } from './test-utils';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

jest.mock('@/hooks', () => ({
  ...jest.requireActual('@/hooks'),
  useMotion: () => ({ reduceMotion: true, enabled: false, duration: () => 0 }),
}));

describe('Dialog', () => {
  it('renders nothing when visible=false', async () => {
    const { queryByTestId } = await render(
      <Dialog visible={false} onClose={() => {}} testID="dlg" />,
      { wrapper: Providers },
    );
    expect(queryByTestId('dlg')).toBeNull();
  });

  it('renders title and content when visible=true', async () => {
    const { getByText, getByTestId } = await render(
      <Dialog visible onClose={() => {}} title="Are you sure?" testID="dlg">
        <RNText>Body content</RNText>
      </Dialog>,
      { wrapper: Providers },
    );
    expect(getByTestId('dlg')).toBeTruthy();
    expect(getByText('Are you sure?')).toBeTruthy();
    expect(getByText('Body content')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', async () => {
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <Dialog visible onClose={onClose} title="Hello" testID="dlg" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dlg-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is pressed (dismissOnBackdrop=true)', async () => {
    const onClose = jest.fn();
    const { findByTestId } = await render(
      <Dialog visible onClose={onClose} title="Hello" testID="dlg" />,
      { wrapper: Providers },
    );
    const backdrop = await findByTestId('dlg-backdrop');
    fireEvent.press(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop when dismissOnBackdrop=false', async () => {
    const onClose = jest.fn();
    const { findByTestId } = await render(
      <Dialog visible onClose={onClose} title="Hello" dismissOnBackdrop={false} testID="dlg" />,
      { wrapper: Providers },
    );
    const backdrop = await findByTestId('dlg-backdrop');
    fireEvent.press(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides the close button when showCloseButton=false', async () => {
    const { queryByTestId } = await render(
      <Dialog visible onClose={() => {}} title="Hello" showCloseButton={false} testID="dlg" />,
      { wrapper: Providers },
    );
    expect(queryByTestId('dlg-close')).toBeNull();
  });

  it('renders description when provided', async () => {
    const { getByText } = await render(
      <Dialog visible onClose={() => {}} title="Title" description="A description." testID="dlg" />,
      { wrapper: Providers },
    );
    expect(getByText('A description.')).toBeTruthy();
  });
});
