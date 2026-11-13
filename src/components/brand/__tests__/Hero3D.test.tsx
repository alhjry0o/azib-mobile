import { StyleSheet, Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';

import { useDeviceTierStore } from '@/hooks';
import { Providers } from '@/components/ui/__tests__/test-utils';

import { Hero3D } from '../Hero3D';

function flattenStyle(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('Hero3D', () => {
  afterEach(() => {
    useDeviceTierStore.setState({ override: null });
  });

  it('renders foreground', async () => {
    function Wrapper() {
      const progress = useSharedValue(0);
      return (
        <Hero3D
          progress={progress}
          foreground={<RNText>Hero content</RNText>}
          testID="hero"
        />
      );
    }
    const { getByText, getByTestId } = await render(<Wrapper />, { wrapper: Providers });
    expect(getByTestId('hero')).toBeTruthy();
    expect(getByText('Hero content')).toBeTruthy();
  });

  it('renders background and midground when provided', async () => {
    function Wrapper() {
      const progress = useSharedValue(0);
      return (
        <Hero3D
          progress={progress}
          background={<RNText>BG</RNText>}
          midground={<RNText>MG</RNText>}
          foreground={<RNText>FG</RNText>}
          testID="hero"
        />
      );
    }
    const { getByText } = await render(<Wrapper />, { wrapper: Providers });
    expect(getByText('BG')).toBeTruthy();
    expect(getByText('MG')).toBeTruthy();
    expect(getByText('FG')).toBeTruthy();
  });

  it('respects custom height', async () => {
    function Wrapper() {
      const progress = useSharedValue(0);
      return (
        <Hero3D progress={progress} foreground={<RNText>X</RNText>} height={500} testID="hero" />
      );
    }
    const { getByTestId } = await render(<Wrapper />, { wrapper: Providers });
    const flat = flattenStyle(getByTestId('hero').props.style);
    expect(flat.height).toBe(500);
  });

  it('renders without crashing on Tier low', async () => {
    useDeviceTierStore.setState({ override: 'low' });
    function Wrapper() {
      const progress = useSharedValue(0.5);
      return (
        <Hero3D progress={progress} foreground={<RNText>X</RNText>} testID="hero" />
      );
    }
    const { getByTestId } = await render(<Wrapper />, { wrapper: Providers });
    expect(getByTestId('hero')).toBeTruthy();
  });

  it('accepts progress=1 without crashing', async () => {
    function Wrapper() {
      const progress = useSharedValue(1);
      return (
        <Hero3D
          progress={progress}
          background={<RNText>BG</RNText>}
          midground={<RNText>MG</RNText>}
          foreground={<RNText>FG</RNText>}
          testID="hero"
        />
      );
    }
    const { getByTestId } = await render(<Wrapper />, { wrapper: Providers });
    expect(getByTestId('hero')).toBeTruthy();
  });
});
