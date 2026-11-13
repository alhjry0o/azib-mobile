import { render } from '@testing-library/react-native';

import { QamariyaPattern } from '../QamariyaPattern';

describe('QamariyaPattern', () => {
  it('renders without crashing', async () => {
    const { getByTestId } = await render(<QamariyaPattern testID="qp" />);
    expect(getByTestId('qp')).toBeTruthy();
  });

  it('accepts custom width and height', async () => {
    const { getByTestId } = await render(<QamariyaPattern width={400} height={200} testID="qp" />);
    expect(getByTestId('qp')).toBeTruthy();
  });

  it('accepts custom color and opacity', async () => {
    const { getByTestId } = await render(
      <QamariyaPattern color="#9B5CFF" opacity={0.15} testID="qp" />,
    );
    expect(getByTestId('qp')).toBeTruthy();
  });

  it('does not intercept pointer events', async () => {
    const { getByTestId } = await render(<QamariyaPattern testID="qp" />);
    const el = getByTestId('qp');
    expect(el.props.pointerEvents).toBe('none');
  });
});
