import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { SectionErrorBoundary } from '../components/SectionErrorBoundary';

let shouldThrow = true;

function Bomb() {
  if (shouldThrow) throw new Error('section failure');
  return <Text testID="recovered">recovered</Text>;
}

describe('SectionErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = true;
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('isolates a failing section and keeps siblings alive', async () => {
    await render(
      <Providers>
        <View>
          <SectionErrorBoundary testID="boundary-a">
            <Bomb />
          </SectionErrorBoundary>
          <SectionErrorBoundary testID="boundary-b">
            <Text testID="sibling">sibling alive</Text>
          </SectionErrorBoundary>
        </View>
      </Providers>,
    );
    expect(screen.getByTestId('boundary-a-fallback')).toBeTruthy();
    expect(screen.getByTestId('sibling')).toBeTruthy();
  });

  it('retry resets the boundary and calls the section retry', async () => {
    const onRetry = jest.fn();
    await render(
      <Providers>
        <SectionErrorBoundary testID="boundary" onRetry={onRetry}>
          <Bomb />
        </SectionErrorBoundary>
      </Providers>,
    );
    shouldThrow = false;
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('recovered')).toBeTruthy();
  });
});
