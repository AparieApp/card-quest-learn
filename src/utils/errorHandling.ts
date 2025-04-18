
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, fallbackMessage = 'An error occurred'): AppError => {
  if (error instanceof AppError) {
    toast.error(error.message);
    return error;
  }

  console.error('Application error:', error);
  const appError = new AppError(
    error instanceof Error ? error.message : fallbackMessage,
    undefined,
    error
  );
  toast.error(appError.message);
  return appError;
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

