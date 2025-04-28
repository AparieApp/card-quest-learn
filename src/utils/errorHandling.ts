
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

  // Log the error but sanitize before sending to user
  console.error('Application error:', error);
  
  // Create a sanitized error without exposing sensitive details
  const appError = new AppError(
    error instanceof Error ? sanitizeErrorMessage(error.message) : fallbackMessage,
    undefined,
    error
  );
  
  toast.error(appError.message);
  return appError;
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// Sanitize error messages to prevent information disclosure
const sanitizeErrorMessage = (message: string): string => {
  // List of patterns to sanitize (DB errors, auth errors, etc)
  const sensitivePatterns = [
    /supabase/i,
    /postgres/i,
    /database/i,
    /sql/i,
    /constraint/i,
    /violation/i,
    /token/i,
    /key/i,
    /auth/i,
    /password/i,
    /email/i
  ];
  
  // If message contains sensitive information, return generic message
  if (sensitivePatterns.some(pattern => pattern.test(message))) {
    return 'An error occurred. Please try again.';
  }
  
  return message;
};

// Create specific error types for different scenarios
export class AuthError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'AUTH_ERROR', originalError);
  }
}

export class DataError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATA_ERROR', originalError);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'VALIDATION_ERROR', originalError);
  }
}
