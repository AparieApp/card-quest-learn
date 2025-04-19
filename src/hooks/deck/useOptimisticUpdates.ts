
import { useState, useRef } from 'react';
import { OptimisticUpdateState } from '@/types/cardOperations';

export const useOptimisticUpdates = (): OptimisticUpdateState => {
  const [isOptimisticUpdating, setIsOptimisticUpdating] = useState(false);
  const [isThrottlingPaused, setIsThrottlingPaused] = useState(false);
  const optimisticTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearOptimisticTimeout = () => {
    if (optimisticTimeoutRef.current) {
      clearTimeout(optimisticTimeoutRef.current);
      optimisticTimeoutRef.current = null;
    }
  };
  
  const setOptimisticUpdatingWithTimeout = (value: boolean) => {
    clearOptimisticTimeout();
    setIsOptimisticUpdating(value);
    
    if (value) {
      optimisticTimeoutRef.current = setTimeout(() => {
        console.log('Safety timeout: Resetting isOptimisticUpdating');
        setIsOptimisticUpdating(false);
      }, 5000);
    }
  };

  return {
    isOptimisticUpdating,
    isThrottlingPaused,
    setIsThrottlingPaused,
    setOptimisticUpdatingWithTimeout,
    clearOptimisticTimeout
  };
};
