import { fireEvent, render } from '@testing-library/react-native';

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
    const { getByTestId, findByText } = await render(
      <DatePicker value={null} onChange={() => {}} placeholder="Pick" testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    
    // Await the modal buttons to appear
    expect(await findByText('Today')).toBeTruthy();
    expect(await findByText('Clear')).toBeTruthy();
  });

  it('selects a date and calls onChange', async () => {
    const onChange = jest.fn();
    const { getByTestId, findAllByRole } = await render(
      <DatePicker value={new Date(2026, 0, 1)} onChange={onChange} testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    
    // Await all buttons to be rendered in the modal
    const buttons = await findAllByRole('button');
    const dayButtons = buttons.filter((b) => {
      const label = b.props.accessibilityLabel;
      return typeof label === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(label);
    });
    
    expect(dayButtons.length).toBeGreaterThan(0);
    fireEvent.press(dayButtons[0]!);
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange(null) when Clear pressed', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = await render(
      <DatePicker value={new Date(2026, 0, 15)} onChange={onChange} testID="dp" />,
      { wrapper: Providers },
    );
    fireEvent.press(getByTestId('dp'));
    const clearBtn = await findByText('Clear');
    fireEvent.press(clearBtn);
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
