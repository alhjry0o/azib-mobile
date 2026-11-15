import { fireEvent, render, screen } from '@testing-library/react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { RoutePlaceholder } from '../RoutePlaceholder';

describe('RoutePlaceholder', () => {
  it('renders title, description and the honest phase badge', () => {
    render(
      <Providers>
        <RoutePlaceholder
          title="Assistance"
          description="Ships later with human review."
          phase="P08"
          testID="placeholder"
        />
      </Providers>,
    );
    expect(screen.getByTestId('placeholder')).toBeTruthy();
    expect(screen.getByText('Assistance')).toBeTruthy();
    expect(screen.getByText('Ships later with human review.')).toBeTruthy();
    expect(screen.getByText('Built in P08')).toBeTruthy();
  });

  it('runs the provided action (no dead buttons)', () => {
    const onPress = jest.fn();
    render(
      <Providers>
        <RoutePlaceholder
          title="Assistance"
          description="Desc"
          phase="P08"
          action={{ label: 'Go home', onPress }}
          testID="placeholder"
        />
      </Providers>,
    );
    fireEvent.press(screen.getByTestId('placeholder-action'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders no button when no action is provided', () => {
    render(
      <Providers>
        <RoutePlaceholder title="T" description="D" phase="P10" testID="placeholder" />
      </Providers>,
    );
    expect(screen.queryByTestId('placeholder-action', { includeHiddenElements: true })).toBeNull();
  });
});
