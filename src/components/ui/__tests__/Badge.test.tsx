import { render } from '@testing-library/react-native';

import { Badge } from '../Badge';
import { Providers } from './test-utils';

describe('Badge', () => {
  it('renders the label', async () => {
    const { getByText } = await render(<Badge label="Active" />, { wrapper: Providers });
    expect(getByText('Active')).toBeTruthy();
  });

  it('renders verified preset with check icon (rendered as View, no crash)', async () => {
    const { getByText } = await render(<Badge label="Verified" variant="verified" />, {
      wrapper: Providers,
    });
    expect(getByText('Verified')).toBeTruthy();
  });

  it('renders demo preset', async () => {
    const { getByText } = await render(<Badge label="Demo" variant="demo" />, {
      wrapper: Providers,
    });
    expect(getByText('Demo')).toBeTruthy();
  });

  it('renders small size', async () => {
    const { getByText } = await render(<Badge label="Sm" size="sm" />, { wrapper: Providers });
    expect(getByText('Sm')).toBeTruthy();
  });

  it('accepts raw color variants', async () => {
    const { getByText } = await render(<Badge label="Danger" variant="danger" />, {
      wrapper: Providers,
    });
    expect(getByText('Danger')).toBeTruthy();
  });
});
