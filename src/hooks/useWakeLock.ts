import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Battery saver or permission denied — silently ignore
    }
  }, []);

  useEffect(() => {
    acquire();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      sentinelRef.current?.release();
    };
  }, [acquire]);
}
