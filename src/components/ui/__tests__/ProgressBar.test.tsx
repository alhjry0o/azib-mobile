import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { ProgressBar } from '../ProgressBar';

function flatten(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('ProgressBar', () => {
  it('renders determinate bar with value', async () => {
    const { getByTestId } = await render(<ProgressBar value={0.5} testID="pb" />, {
      wrapper: Providers,
    });
    expect(getByTestId('pb')).toBeTruthy();
  });

  it('exposes accessibilityValue for determinate', async () => {
    const { getByRole } = await render(<ProgressBar value={0.75} />, { wrapper: Providers });
    const el = getByRole('progressbar');
    expect(el.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 75 });
  });

  it('clamps values outside 0..1', async () => {
    const { getByRole } = await render(<ProgressBar value={1.5} />, { wrapper: Providers });
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });

  it('renders indeterminate without accessibilityValue', async () => {
    const { getByRole } = await render(<ProgressBar />, { wrapper: Providers });
    const el = getByRole('progressbar');
    expect(el.props.accessibilityValue).toBeUndefined();
  });

  it('showLabel renders percent text', async () => {
    const { getByText } = await render(<ProgressBar value={0.42} showLabel />, {
      wrapper: Providers,
    });
    expect(getByText('42%')).toBeTruthy();
  });

  it('does not render label when indeterminate', async () => {
    const { queryByText } = await render(<ProgressBar showLabel />, { wrapper: Providers });
    expect(queryByText(/%/)).toBeNull();
  });

  it('applies size sm height', async () => {
    const { getByRole } = await render(<ProgressBar value={0.3} size="sm" />, {
      wrapper: Providers,
    });
    const flat = flatten(getByRole('progressbar').props.style);
    expect(flat.height).toBe(4);
  });

  it('applies size lg height', async () => {
    const { getByRole } = await render(<ProgressBar value={0.3} size="lg" />, {
      wrapper: Providers,
    });
    const flat = flatten(getByRole('progressbar').props.style);
    expect(flat.height).toBe(12);
  });
});
