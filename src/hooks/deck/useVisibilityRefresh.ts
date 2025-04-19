
import { useEffect } from 'react';

export const useVisibilityRefresh = (
  onRefresh: () => Promise<void>,
  lastRefreshTime: number,
  minimumInterval = 30000
) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        
        if (timeSinceLastRefresh > minimumInterval) {
          console.log('Tab became visible and refresh needed');
          onRefresh();
        } else {
          console.log('Tab became visible but refresh not needed (last refresh was', timeSinceLastRefresh, 'ms ago)');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onRefresh, lastRefreshTime, minimumInterval]);
};
