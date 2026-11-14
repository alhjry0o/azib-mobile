import { render } from '@testing-library/react-native';

import { useDeviceTierStore } from '@/hooks';
import { Providers } from '@/components/ui/__tests__/test-utils';

import { DoubleRingLoader } from '../DoubleRingLoader';

describe('DoubleRingLoader', () => {
  afterEach(() => {
    useDeviceTierStore.setState({ override: null });
  });

  it('renders with default size', async () => {
    const { getByTestId } = await render(<DoubleRingLoader testID="dlr" />, {
      wrapper: Providers,
    });
    expect(getByTestId('dlr')).toBeTruthy();
  });

  it('exposes role=progressbar', async () => {
    const { getByTestId } = await render(<DoubleRingLoader testID="dlr" />, {
      wrapper: Providers,
    });
    const el = getByTestId('dlr');
    expect(el.props.accessibilityRole).toBe('progressbar');
  });

  it('accepts custom size', async () => {
    const { getByTestId } = await render(<DoubleRingLoader size={48} testID="dlr" />, {
      wrapper: Providers,
    });
    expect(getByTestId('dlr')).toBeTruthy();
  });

  it('accepts custom color', async () => {
    const { getByTestId } = await render(
      <DoubleRingLoader color="#F0CA68" testID="dlr" />,
      { wrapper: Providers },
    );
    expect(getByTestId('dlr')).toBeTruthy();
  });

  it('renders without crashing on Tier low (motion disabled)', async () => {
    useDeviceTierStore.setState({ override: 'low' });
    const { getByTestId } = await render(<DoubleRingLoader testID="dlr" />, {
      wrapper: Providers,
    });
    expect(getByTestId('dlr')).toBeTruthy();
  });
});
