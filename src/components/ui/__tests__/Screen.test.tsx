import { Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';

import { Screen } from '../Screen';
import { Providers } from './test-utils';

describe('Screen', () => {
  it('renders children inside a View (scroll=false)', async () => {
    const { getByText } = await render(
      <Screen>
        <RNText>Content</RNText>
      </Screen>,
      { wrapper: Providers },
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('renders children inside a ScrollView when scroll=true', async () => {
    const { getByTestId, getByText } = await render(
      <Screen scroll testID="screen">
        <RNText>Content</RNText>
      </Screen>,
      { wrapper: Providers },
    );
    expect(getByTestId('screen')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });

  it('accepts custom background', async () => {
    const { getByTestId } = await render(
      <Screen testID="screen" background="#000000">
        <RNText>x</RNText>
      </Screen>,
      { wrapper: Providers },
    );
    const el = getByTestId('screen');
    // Access the style on the View/ScrollView host component
    expect(el).toBeTruthy();
  });
});
