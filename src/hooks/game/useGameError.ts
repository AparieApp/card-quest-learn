
import { useState, useCallback } from 'react';
import { handleError, AppError } from '@/utils/errorHandling';
import { toast } from 'sonner';

export interface GameErrorState {
  hasError: boolean;
  errorMessage: string | null;
  errorCode: string | null;
}

export const useGameError = () => {
  const [errorState, setErrorState] = useState<GameErrorState>({
    hasError: false,
    errorMessage: null,
    errorCode: null,
  });

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      errorMessage: null,
      errorCode: null,
    });
  }, []);

  const handleGameError = useCallback((error: unknown, operation: string) => {
    const appError = handleError(error, `Failed to ${operation}`);
    
    setErrorState({
      hasError: true,
      errorMessage: appError.message,
      errorCode: appError.code || 'UNKNOWN_ERROR',
    });

    return appError;
  }, []);

  const showGameWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  return {
    errorState,
    clearError,
    handleGameError,
    showGameWarning
  };
};
