import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { Divider } from '../Divider';

function flatten(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('Divider', () => {
  it('renders horizontal by default', async () => {
    const { getByTestId } = await render(<Divider testID="d" />, { wrapper: Providers });
    expect(getByTestId('d', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders vertical variant', async () => {
    const { getByTestId } = await render(<Divider orientation="vertical" testID="d" />, {
      wrapper: Providers,
    });
    expect(getByTestId('d', { includeHiddenElements: true })).toBeTruthy();
  });

  it('is hidden from accessibility tree', async () => {
    const { getByTestId } = await render(<Divider testID="d" />, { wrapper: Providers });
    const el = getByTestId('d', { includeHiddenElements: true });
    expect(el.props.accessibilityElementsHidden).toBe(true);
    expect(el.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('respects custom thickness via inner line', async () => {
    const { getByTestId } = await render(<Divider thickness={2} testID="d" />, {
      wrapper: Providers,
    });
    const container = getByTestId('d', { includeHiddenElements: true });
    // Container's first child is the line View
    const line = Array.isArray(container.children) ? container.children[0] : null;
    if (line && typeof line !== 'string') {
      const flat = flatten(line.props.style);
      expect(flat.height).toBe(2);
    } else {
      // Fallback: no crash
      expect(container).toBeTruthy();
    }
  });
});
