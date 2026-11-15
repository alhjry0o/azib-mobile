import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { AnimatedSplash } from '../AnimatedSplash';

describe('AnimatedSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function renderSplash() {
    const onFinish = jest.fn();
    render(
      <Providers>
        <AnimatedSplash onFinish={onFinish} />
      </Providers>,
    );
    return onFinish;
  }

  it('renders the brand elements and the skip button', async () => {
    renderSplash();
    await act(async () => {});
    expect(screen.getByTestId('animated-splash')).toBeTruthy();
    expect(screen.getByTestId('splash-ring-left')).toBeTruthy();
    expect(screen.getByTestId('splash-ring-right')).toBeTruthy();
    expect(screen.getByTestId('splash-skip')).toBeTruthy();
  });

  it('finishes immediately on skip, exactly once', async () => {
    const onFinish = renderSplash();
    await act(async () => {});
    fireEvent.press(screen.getByTestId('splash-skip'));
    fireEvent.press(screen.getByTestId('splash-skip'));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('auto-finishes after the short duration', async () => {
    const onFinish = renderSplash();
    await act(async () => {});
    expect(onFinish).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2300);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('uses the static Reduce Motion alternative and finishes sooner', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const onFinish = renderSplash();
    await act(async () => {});
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
