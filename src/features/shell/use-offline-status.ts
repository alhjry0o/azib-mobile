// Real connectivity via NetInfo. Unknown (null) is treated as online to
// avoid false offline banners during startup.
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOfflineStatus(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch()
      .then((state) => {
        if (mounted) setOffline(state.isConnected === false);
      })
      .catch(() => {
        // Connectivity check is best-effort; never crash the shell.
      });
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return offline;
}
