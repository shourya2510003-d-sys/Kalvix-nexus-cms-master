import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to log out a user after a period of inactivity.
 * @param onTimeout Callback function to execute when the user times out.
 * @param timeoutMs The inactivity duration in milliseconds before timing out. Defaults to 30 minutes.
 */
export function useInactivityTimeout(onTimeout: () => void, timeoutMs: number = 30 * 60 * 1000) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutMs / 1000);
  const targetTimeRef = useRef<number>(Date.now() + timeoutMs);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Check activity and update countdown every second
    const intervalId = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((targetTimeRef.current - now) / 1000));
      setRemainingSeconds(left);

      if (now >= targetTimeRef.current) {
        onTimeout();
      }
    }, 1000);

    const handleActivity = () => {
      // Throttle activity updates to at most once per second to prevent re-render lag
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
        targetTimeRef.current = now + timeoutMs;
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      clearInterval(intervalId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [onTimeout, timeoutMs]);

  return remainingSeconds;
}
