import { useEffect, useState } from 'react';

/** Pure: testable without timers. */
export function greetingKeyForHour(hour: number): string {
  if (hour < 12) return 'home:greeting.morning';
  if (hour < 17) return 'home:greeting.afternoon';
  return 'home:greeting.evening';
}

export function useHomeGreeting(): string {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return greetingKeyForHour(hour);
}
