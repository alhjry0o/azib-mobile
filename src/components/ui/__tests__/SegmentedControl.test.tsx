import { fireEvent, render } from '@testing-library/react-native';

import { SegmentedControl } from '../SegmentedControl';
import { Providers } from './test-utils';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

const SEGMENTS = [
  { value: 'all' as const, label: 'All' },
  { value: 'active' as const, label: 'Active' },
  { value: 'done' as const, label: 'Done' },
];

describe('SegmentedControl', () => {
  it('renders all segment labels', async () => {
    const { getByText } = await render(
      <SegmentedControl segments={SEGMENTS} value="all" onChange={() => {}} />,
      { wrapper: Providers },
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('calls onChange when a segment is pressed', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(
      <SegmentedControl segments={SEGMENTS} value="all" onChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Active'));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('marks the selected segment via accessibilityState', async () => {
    const { getAllByRole } = await render(
      <SegmentedControl segments={SEGMENTS} value="active" onChange={() => {}} />,
      { wrapper: Providers },
    );
    const tabs = getAllByRole('tab');
    expect(tabs[0]?.props.accessibilityState.selected).toBe(false);
    expect(tabs[1]?.props.accessibilityState.selected).toBe(true);
    expect(tabs[2]?.props.accessibilityState.selected).toBe(false);
  });

  it('does not fire onChange for disabled segments', async () => {
    const onChange = jest.fn();
    const segments = [
      { value: 'a' as const, label: 'A' },
      { value: 'b' as const, label: 'B', disabled: true },
    ];
    const { getByText } = await render(
      <SegmentedControl segments={segments} value="a" onChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('B'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports sm size', async () => {
    const { getByText } = await render(
      <SegmentedControl segments={SEGMENTS} value="all" onChange={() => {}} size="sm" />,
      { wrapper: Providers },
    );
    expect(getByText('All')).toBeTruthy();
  });
});
