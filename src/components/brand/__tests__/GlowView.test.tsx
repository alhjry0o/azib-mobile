import { act, render } from '@testing-library/react-native';
import { StyleSheet, Text as RNText } from 'react-native';

import { useDeviceTierStore } from '@/hooks';
import { Providers } from '@/components/ui/__tests__/test-utils';

import { GlowView } from '../GlowView';

describe('GlowView', () => {
  beforeEach(async () => {
    await act(async () => {
      useDeviceTierStore.setState({ override: 'high' });
    });
  });

  afterEach(async () => {
    await act(async () => {
      useDeviceTierStore.setState({ override: null });
    });
  });

  it('renders children', async () => {
    const { getByText } = await render(
      <GlowView>
        <RNText>Glow</RNText>
      </GlowView>,
      { wrapper: Providers },
    );
    expect(getByText('Glow')).toBeTruthy();
  });

  it('applies glow on high tier (Platform iOS/default)', async () => {
    const { getByTestId } = await render(
      <GlowView testID="glow">
        <RNText>X</RNText>
      </GlowView>,
      { wrapper: Providers },
    );
    const el = getByTestId('glow');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.shadowColor).toBeDefined();
  });

  it('disables glow on low tier', async () => {
    await act(async () => {
      useDeviceTierStore.setState({ override: 'low' });
    });
    const { getByTestId } = await render(
      <GlowView testID="glow">
        <RNText>X</RNText>
      </GlowView>,
      { wrapper: Providers },
    );
    const el = getByTestId('glow');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.shadowColor).toBeUndefined();
  });

  it('accepts gold color', async () => {
    const { getByTestId } = await render(
      <GlowView color="gold" testID="glow">
        <RNText>X</RNText>
      </GlowView>,
      { wrapper: Providers },
    );
    const el = getByTestId('glow');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.shadowColor).toBe('rgba(240, 202, 104, 0.45)');
  });
});
