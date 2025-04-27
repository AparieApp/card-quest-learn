
// Export types and interfaces
export type { 
  AuthUser, 
  AuthActions, 
  AuthContextType,
  AuthState 
} from './types';

// Export providers
export * from './providers/AuthProvider';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils/userUtils';
export * from './utils/errorUtils';

// Default export for backward compatibility
export { useAuth } from './hooks';
