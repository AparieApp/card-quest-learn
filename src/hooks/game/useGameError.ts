
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
    // Customize error message based on operation
    let customMessage: string | undefined;
    
    if (operation === 'load deck') {
      customMessage = 'Failed to load deck. Please try again.';
    } else if (operation === 'load shared deck') {
      customMessage = 'Failed to load shared deck. Please check the link and try again.';
    }
    
    const appError = handleError(error, customMessage || `Failed to ${operation}`);
    
    console.error(`Game error during ${operation}:`, error);
    
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
