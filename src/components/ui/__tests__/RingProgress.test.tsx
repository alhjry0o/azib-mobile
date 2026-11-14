import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { RingProgress } from '../RingProgress';

describe('RingProgress', () => {
  it('renders with value 0', async () => {
    const { getByRole } = await render(<RingProgress value={0} />, { wrapper: Providers });
    expect(getByRole('progressbar').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 0 });
  });

  it('renders with value 0.5 → 50%', async () => {
    const { getByRole } = await render(<RingProgress value={0.5} />, { wrapper: Providers });
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(50);
  });

  it('clamps values above 1 to 100%', async () => {
    const { getByRole } = await render(<RingProgress value={1.5} />, { wrapper: Providers });
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });

  it('clamps negative values to 0%', async () => {
    const { getByRole } = await render(<RingProgress value={-0.5} />, { wrapper: Providers });
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('showLabel renders percent text', async () => {
    const { getByText } = await render(<RingProgress value={0.42} showLabel />, {
      wrapper: Providers,
    });
    expect(getByText('42%')).toBeTruthy();
  });

  it('label overrides default percent text', async () => {
    const { getByText } = await render(
      <RingProgress value={0.42} showLabel label="In progress" />,
      { wrapper: Providers },
    );
    expect(getByText('In progress')).toBeTruthy();
  });

  it('does not show label when showLabel=false', async () => {
    const { queryByText } = await render(<RingProgress value={0.42} />, { wrapper: Providers });
    expect(queryByText('42%')).toBeNull();
  });

  it('accepts custom size and strokeWidth', async () => {
    const { getByTestId } = await render(
      <RingProgress value={0.3} size={120} strokeWidth={10} testID="ring" />,
      { wrapper: Providers },
    );
    expect(getByTestId('ring')).toBeTruthy();
  });
});
