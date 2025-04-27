
import React, { createContext, ReactNode } from 'react';
import { useAuthState } from '../hooks/useAuthState';
import { useAuthActions } from '../hooks/useAuthActions';
import { AuthContextType } from '../types';

// Create the context with undefined as default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const state = useAuthState();
  const actions = useAuthActions();
  
  // Combine state and actions into the context value
  const contextValue: AuthContextType = {
    ...state,
    ...actions,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
