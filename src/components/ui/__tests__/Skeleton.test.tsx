import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { Skeleton } from '../Skeleton';

function flatten(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('Skeleton', () => {
  it('renders with default rect variant', async () => {
    const { getByTestId } = await render(<Skeleton testID="sk" />, { wrapper: Providers });
    expect(getByTestId('sk')).toBeTruthy();
  });

  it('renders text variant with default height', async () => {
    const { getByTestId } = await render(<Skeleton variant="text" testID="sk" />, {
      wrapper: Providers,
    });
    const flat = flatten(getByTestId('sk').props.style);
    expect(flat.height).toBe(14);
  });

  it('renders circle variant with equal width/height', async () => {
    const { getByTestId } = await render(<Skeleton variant="circle" testID="sk" />, {
      wrapper: Providers,
    });
    const flat = flatten(getByTestId('sk').props.style);
    expect(flat.width).toBe(48);
    expect(flat.height).toBe(48);
  });

  it('accepts custom width and height', async () => {
    const { getByTestId } = await render(
      <Skeleton width={120} height={24} testID="sk" />,
      { wrapper: Providers },
    );
    const flat = flatten(getByTestId('sk').props.style);
    expect(flat.width).toBe(120);
    expect(flat.height).toBe(24);
  });

  it('is hidden from accessibility', async () => {
    const { getByTestId } = await render(<Skeleton testID="sk" />, { wrapper: Providers });
    const el = getByTestId('sk');
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });
});
