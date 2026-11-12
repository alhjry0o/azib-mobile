import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { darkTheme } from '@/theme';
import { i18n } from '@/i18n';

import { Text } from '../Text';
import { Providers } from './test-utils';

describe('Text', () => {
  afterEach(async () => {
    await i18n.changeLanguage('ar');
  });

  it('renders children as-is', async () => {
    const { getByText } = await render(<Text>Hello</Text>, { wrapper: Providers });
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders i18nKey translated to current language', async () => {
    await i18n.changeLanguage('en');
    const { getByText } = await render(<Text i18nKey="appName" />, { wrapper: Providers });
    expect(getByText('AZIB')).toBeTruthy();
  });

  it('prefers i18nKey over children when both provided', async () => {
    await i18n.changeLanguage('en');
    const { queryByText, getByText } = await render(
      <Text i18nKey="appName">Fallback</Text>,
      { wrapper: Providers },
    );
    expect(getByText('AZIB')).toBeTruthy();
    expect(queryByText('Fallback')).toBeNull();
  });

  it('applies theme color token', async () => {
    const { getByText } = await render(
      <Text color="accent" testID="t">Hi</Text>,
      { wrapper: Providers },
    );
    const el = getByText('Hi');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.color).toBe(darkTheme.colors.text.accent);
  });

  it('accepts a raw color string', async () => {
    const { getByText } = await render(
      <Text color="#FF0000" testID="t">Hi</Text>,
      { wrapper: Providers },
    );
    const el = getByText('Hi');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.color).toBe('#FF0000');
  });

  it('applies typography variant from theme', async () => {
    const { getByText } = await render(
      <Text variant="h1" testID="t">Title</Text>,
      { wrapper: Providers },
    );
    const el = getByText('Title');
    const flat = StyleSheet.flatten(el.props.style);
    expect(flat.fontSize).toBe(darkTheme.typography.h1.fontSize);
  });

  it('passes accessibilityRole through', async () => {
    const { getByRole } = await render(
      <Text accessibilityRole="header">Header</Text>,
      { wrapper: Providers },
    );
    expect(getByRole('header')).toBeTruthy();
  });
});
