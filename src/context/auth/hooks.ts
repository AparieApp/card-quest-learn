
import { useContext } from 'react';
import { AuthContext } from './providers/AuthProvider';
import { AuthContextType } from './types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export the hooks for easier imports
export * from './hooks/useAuthState';
export * from './hooks/useAuthActions';
