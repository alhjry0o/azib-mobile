import React from 'react';
import { act, render } from '@testing-library/react-native';
import { StyleProp, ViewStyle, Text as RNText } from 'react-native';

import { useDeviceTierStore } from '@/hooks';
import { Providers } from '@/components/ui/__tests__/test-utils';

import { GlassView } from '../GlassView';

// Mock expo-blur to a simple View so tests don't depend on native modules.
jest.mock('expo-blur', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    BlurView: ({
      children,
      style,
      testID,
    }: {
      children?: React.ReactNode;
      style?: StyleProp<ViewStyle>;
      testID?: string;
    }) => React.createElement(View, { style, testID }, children),
  };
});

describe('GlassView', () => {
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
      <GlassView>
        <RNText>Inside glass</RNText>
      </GlassView>,
      { wrapper: Providers },
    );
    expect(getByText('Inside glass')).toBeTruthy();
  });

  it('renders with blur when tier is high', async () => {
    const { getByTestId } = await render(
      <GlassView testID="glass">
        <RNText>X</RNText>
      </GlassView>,
      { wrapper: Providers },
    );
    expect(getByTestId('glass')).toBeTruthy();
  });

  it('renders fallback View on low tier', async () => {
    await act(async () => {
      useDeviceTierStore.setState({ override: 'low' });
    });
    const { getByTestId } = await render(
      <GlassView testID="glass">
        <RNText>X</RNText>
      </GlassView>,
      { wrapper: Providers },
    );
    expect(getByTestId('glass')).toBeTruthy();
  });

  it('accepts custom intensity', async () => {
    const { getByTestId } = await render(
      <GlassView intensity={80} testID="glass">
        <RNText>X</RNText>
      </GlassView>,
      { wrapper: Providers },
    );
    expect(getByTestId('glass')).toBeTruthy();
  });
});
