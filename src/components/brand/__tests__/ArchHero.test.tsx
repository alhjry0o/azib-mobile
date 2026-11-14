import { render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

import { Providers } from '@/components/ui/__tests__/test-utils';

import { ArchHero } from '../ArchHero';

describe('ArchHero', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <ArchHero width={200}>
        <RNText>Hero content</RNText>
      </ArchHero>,
      { wrapper: Providers },
    );
    expect(getByText('Hero content')).toBeTruthy();
  });

  it('applies fixed width from prop', async () => {
    const { getByTestId } = await render(
      <ArchHero width={240} testID="arch">
        <RNText>X</RNText>
      </ArchHero>,
      { wrapper: Providers },
    );
    const el = getByTestId('arch');
    const style = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style)
      : el.props.style;
    expect(style.width).toBe(240);
    expect(style.aspectRatio).toBe(3 / 4);
  });

  it('applies gold border by default (filled)', async () => {
    const { getByTestId } = await render(
      <ArchHero width={200} testID="arch">
        <RNText>X</RNText>
      </ArchHero>,
      { wrapper: Providers },
    );
    const el = getByTestId('arch');
    const style = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style)
      : el.props.style;
    expect(style.borderColor).toBe('#D9A928');
    expect(style.backgroundColor).not.toBe('transparent');
  });

  it('outlined variant has transparent background', async () => {
    const { getByTestId } = await render(
      <ArchHero variant="outlined" width={200} testID="arch">
        <RNText>X</RNText>
      </ArchHero>,
      { wrapper: Providers },
    );
    const el = getByTestId('arch');
    const style = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style)
      : el.props.style;
    expect(style.backgroundColor).toBe('transparent');
  });

  it('accepts custom borderColor', async () => {
    const { getByTestId } = await render(
      <ArchHero width={200} borderColor="#FF0000" testID="arch">
        <RNText>X</RNText>
      </ArchHero>,
      { wrapper: Providers },
    );
    const el = getByTestId('arch');
    const style = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style)
      : el.props.style;
    expect(style.borderColor).toBe('#FF0000');
  });
});
