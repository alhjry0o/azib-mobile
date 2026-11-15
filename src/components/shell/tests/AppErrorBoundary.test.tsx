import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import '@/i18n';
import { AppErrorBoundary } from '../AppErrorBoundary';

let shouldThrow = true;

function BombChild() {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <Text testID="child-ok">ok</Text>;
}

describe('AppErrorBoundary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = true;
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when nothing throws', () => {
    shouldThrow = false;
    render(
      <AppErrorBoundary>
        <BombChild />
      </AppErrorBoundary>,
    );
    expect(screen.getByTestId('child-ok')).toBeTruthy();
  });

  it('catches render errors and recovers via retry', () => {
    render(
      <AppErrorBoundary>
        <BombChild />
      </AppErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary')).toBeTruthy();
    shouldThrow = false;
    fireEvent.press(screen.getByTestId('error-boundary-retry'));
    expect(screen.getByTestId('child-ok')).toBeTruthy();
  });
});
