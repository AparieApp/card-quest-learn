
import React, { ReactNode } from 'react';
import { AuthContext } from './context/AuthContext';
import { useAuthInitialization } from './hooks/useAuthInitialization';
import { useAuthActions } from './hooks/useAuthActions';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const state = useAuthInitialization();
  const actions = useAuthActions();
  
  return (
    <AuthContext.Provider value={{ 
      ...state, 
      ...actions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Re-export the context for convenience
export { AuthContext };

