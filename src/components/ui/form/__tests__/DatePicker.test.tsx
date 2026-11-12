import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { Providers } from '../../__tests__/test-utils';
import { DatePicker } from '../DatePicker';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

describe('DatePicker', () => {
  it('shows placeholder when no value', async () => {
    const { getByText } = await render(
      <DatePicker value={null} onChange={() => {}} placeholder="Pick a date" testID="dp" />,
      { wrapper: Providers },
    );
    expect(getByText('Pick a date')).toBeTruthy();
  });

  it('opens calendar modal on press', async () => {
    const { getByTestId, getByText } = await render(
      <DatePicker value={null} onChange={() => {}} placeholder="Pick" testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    
    // Wait for the modal to appear
    await waitFor(() => {
      expect(getByText('Today')).toBeTruthy();
      expect(getByText('Clear')).toBeTruthy();
    });
  });

  it('selects a date and calls onChange', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <DatePicker value={new Date(2026, 0, 1)} onChange={onChange} testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    
    // Wait for the calendar to open
    await waitFor(() => expect(getByText('Today')).toBeTruthy());

    // Find the number 15 and press it (it exists in every month)
    const day15 = getByText('15');
    fireEvent.press(day15);
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange(null) when Clear pressed', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText } = await render(
      <DatePicker value={new Date(2026, 0, 15)} onChange={onChange} testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    
    await waitFor(() => expect(getByText('Clear')).toBeTruthy());
    
    fireEvent.press(getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('respects disabled', async () => {
    const { getByTestId, queryByText } = await render(
      <DatePicker value={null} onChange={() => {}} disabled placeholder="Pick" testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    expect(queryByText('Today')).toBeNull();
  });
});
