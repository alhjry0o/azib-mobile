import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

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
      .mockImplementation((() => ({
        remove: removeListener,
      })) as any);
  });

  afterEach(() => {
    isReduceMotionSpy.mockRestore();
    addEventListenerSpy.mockRestore();
  });

  it('starts with reduceMotion=false and enabled=true', async () => {
    // renderHook is async in new testing-library versions. We await it.
    const { result } = await renderHook(() => useMotion());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.reduceMotion).toBe(false);
  });

  it('duration(ms) returns ms when motion is allowed', async () => {
    const { result } = await renderHook(() => useMotion());
    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.duration(240)).toBe(240);
  });

  it('duration(ms) returns 0 when reduce motion is enabled', async () => {
    isReduceMotionSpy.mockResolvedValue(true);
    const { result } = await renderHook(() => useMotion());
    await waitFor(() => expect(result.current.reduceMotion).toBe(true));
    expect(result.current.duration(240)).toBe(0);
  });

  it('subscribes and cleans up the listener', async () => {
    const { unmount } = await renderHook(() => useMotion());
    await waitFor(() => expect(addEventListenerSpy).toHaveBeenCalled());
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });

  it('exposes enabled as the inverse of reduceMotion', async () => {
    isReduceMotionSpy.mockResolvedValue(true);
    const { result } = await renderHook(() => useMotion());
    await waitFor(() => expect(result.current.reduceMotion).toBe(true));
    expect(result.current.enabled).toBe(false);
  });
});
