import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders initials from two-word name', async () => {
    const { getByText } = await render(<Avatar name="Ahmed Yemeni" />, { wrapper: Providers });
    expect(getByText('AY')).toBeTruthy();
  });

  it('renders single initial from one-word name', async () => {
    const { getByText } = await render(<Avatar name="Fatima" />, { wrapper: Providers });
    expect(getByText('F')).toBeTruthy();
  });

  it('renders question mark for empty name', async () => {
    const { getByText } = await render(<Avatar name="   " />, { wrapper: Providers });
    expect(getByText('?')).toBeTruthy();
  });

  it('exposes name as accessibility label with role image', async () => {
    const { getByTestId } = await render(<Avatar name="Ahmed" testID="av" />, {
      wrapper: Providers,
    });
    const el = getByTestId('av');
    expect(el.props.accessibilityRole).toBe('image');
    expect(el.props.accessibilityLabel).toBe('Ahmed');
  });

  it('renders without ring by default (no borderWidth applied)', async () => {
    const { getByTestId } = await render(<Avatar name="X" testID="av" />, {
      wrapper: Providers,
    });
    // ring=false → borderWidth: 0. Simple smoke test.
    expect(getByTestId('av')).toBeTruthy();
  });

  it('renders with gold ring when ring=true (does not crash)', async () => {
    const { getByTestId } = await render(<Avatar name="X" ring testID="av" />, {
      wrapper: Providers,
    });
    expect(getByTestId('av')).toBeTruthy();
  });

  it('renders all sizes without crashing', async () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const { getByTestId, unmount } = await render(
        <Avatar name="Test User" size={size} testID="av" />,
        { wrapper: Providers },
      );
      expect(getByTestId('av')).toBeTruthy();
      unmount();
    }
  });
});
