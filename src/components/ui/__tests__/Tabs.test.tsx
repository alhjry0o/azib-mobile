import { fireEvent, render } from '@testing-library/react-native';

import { Tabs } from '../Tabs';
import { Providers } from './test-utils';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

const TABS = [
  { key: 'overview' as const, label: 'Overview' },
  { key: 'activity' as const, label: 'Activity', badge: 3 },
  { key: 'settings' as const, label: 'Settings' },
];

describe('Tabs', () => {
  it('renders all tab labels', async () => {
    const { getByText } = await render(
      <Tabs tabs={TABS} value="overview" onChange={() => {}} />,
      { wrapper: Providers },
    );
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Activity')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders badge when provided', async () => {
    const { getByText } = await render(
      <Tabs tabs={TABS} value="overview" onChange={() => {}} />,
      { wrapper: Providers },
    );
    expect(getByText('3')).toBeTruthy();
  });

  it('calls onChange with tab key when pressed', async () => {
    const onChange = jest.fn();
    const { getByText } = await render(
      <Tabs tabs={TABS} value="overview" onChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('Activity'));
    expect(onChange).toHaveBeenCalledWith('activity');
  });

  it('marks the active tab selected via accessibility', async () => {
    const { getAllByRole } = await render(
      <Tabs tabs={TABS} value="activity" onChange={() => {}} />,
      { wrapper: Providers },
    );
    const tabs = getAllByRole('tab');
    expect(tabs[0]?.props.accessibilityState.selected).toBe(false);
    expect(tabs[1]?.props.accessibilityState.selected).toBe(true);
    expect(tabs[2]?.props.accessibilityState.selected).toBe(false);
  });

  it('does not fire onChange for disabled tabs', async () => {
    const onChange = jest.fn();
    const tabs = [
      { key: 'a' as const, label: 'A' },
      { key: 'b' as const, label: 'B', disabled: true },
    ];
    const { getByText } = await render(
      <Tabs tabs={tabs} value="a" onChange={onChange} />,
      { wrapper: Providers },
    );
    fireEvent.press(getByText('B'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports pills variant', async () => {
    const { getByText } = await render(
      <Tabs tabs={TABS} value="overview" onChange={() => {}} variant="pills" />,
      { wrapper: Providers },
    );
    expect(getByText('Overview')).toBeTruthy();
  });
});
