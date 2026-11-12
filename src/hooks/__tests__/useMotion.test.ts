import { renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, type AccessibilityChangeEventName } from 'react-native';

import { useMotion } from '../useMotion';

describe('useMotion', () => {
  let isReduceMotionSpy: jest.SpyInstance;
  let addEventListenerSpy: jest.SpyInstance;
  let removeListener: jest.Mock;

  beforeEach(() => {
    removeListener = jest.fn();
    isReduceMotionSpy = jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
    addEventListenerSpy = jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockImplementation(((_event: AccessibilityChangeEventName) => ({
        remove: removeListener,
      })) as unknown as typeof AccessibilityInfo.addEventListener);
  });

  afterEach(() => {
    isReduceMotionSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  });

  it('starts with reduceMotion=false and enabled=true', async () => {
    const { result } = renderHook(() => useMotion());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.reduceMotion).toBe(false);
  });

  it('duration(ms) returns ms when motion is allowed', async () => {
    const { result } = renderHook(() => useMotion());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.duration(240)).toBe(240);
  });

  it('duration(ms) returns 0 when reduce motion is enabled', async () => {
    isReduceMotionSpy.mockResolvedValue(true);
    const { result } = renderHook(() => useMotion());
    await waitFor(() => expect(result.current.reduceMotion).toBe(true));
    expect(result.current.duration(240)).toBe(0);
  });

  it('subscribes and cleans up the listener', async () => {
    const { unmount } = renderHook(() => useMotion());
    await waitFor(() => expect(addEventListenerSpy).toHaveBeenCalled());
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });

  it('exposes enabled as the inverse of reduceMotion', async () => {
    isReduceMotionSpy.mockResolvedValue(true);
    const { result } = renderHook(() => useMotion());
    await waitFor(() => expect(result.current.reduceMotion).toBe(true));
    expect(result.current.enabled).toBe(false);
  });
});
