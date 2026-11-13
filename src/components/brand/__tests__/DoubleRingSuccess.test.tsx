import { render } from '@testing-library/react-native';

import { useDeviceTierStore } from '@/hooks';
import { Providers } from '@/components/ui/__tests__/test-utils';

import { DoubleRingSuccess } from '../DoubleRingSuccess';

describe('DoubleRingSuccess', () => {
  afterEach(() => {
    useDeviceTierStore.setState({ override: null });
  });

  it('renders with default size', async () => {
    const { getByTestId } = await render(<DoubleRingSuccess testID="drs" />, {
      wrapper: Providers,
    });
    expect(getByTestId('drs')).toBeTruthy();
  });

  it('exposes role=image with success label', async () => {
    const { getByTestId } = await render(<DoubleRingSuccess testID="drs" />, {
      wrapper: Providers,
    });
    const el = getByTestId('drs');
    expect(el.props.accessibilityRole).toBe('image');
    expect(el.props.accessibilityLabel).toBe('success');
  });

  it('accepts custom size and color', async () => {
    const { getByTestId } = await render(
      <DoubleRingSuccess size={88} color="#3FCF8E" testID="drs" />,
      { wrapper: Providers },
    );
    expect(getByTestId('drs')).toBeTruthy();
  });

  it('accepts custom accessibility label', async () => {
    const { getByTestId } = await render(
      <DoubleRingSuccess testID="drs" accessibilityLabel="completed" />,
      { wrapper: Providers },
    );
    expect(getByTestId('drs').props.accessibilityLabel).toBe('completed');
  });

  it('renders without crashing on Tier low', async () => {
    useDeviceTierStore.setState({ override: 'low' });
    const { getByTestId } = await render(<DoubleRingSuccess testID="drs" />, {
      wrapper: Providers,
    });
    expect(getByTestId('drs')).toBeTruthy();
  });
});
