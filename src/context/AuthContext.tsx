
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  checkUsernameAvailability: async () => true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Safely fetch user profile without causing deadlocks
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Process user data and set states
  const processUserData = useCallback(async (supabaseUser: User | null) => {
    try {
      if (!supabaseUser) {
        setUser(null);
        return;
      }

      const profile = await fetchUserProfile(supabaseUser.id);
      
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: profile?.username || supabaseUser.email?.split('@')[0] || '',
      });
    } catch (error) {
      console.error('Error in processUserData:', error);
      setUser(null);
    }
  }, [fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        setIsLoading(true);

        // First set up the auth state listener to ensure we don't miss any events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('Auth state change event:', event);
            setSession(newSession);
            
            // Important: Don't make Supabase calls here directly
            // Use setTimeout to prevent deadlocks
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setTimeout(() => {
                processUserData(newSession?.user || null);
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          }
        );

        // After setting up listener, check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        console.log('Session check complete:', !!sessionData.session);
        setSession(sessionData.session);

        if (sessionData.session?.user) {
          await processUserData(sessionData.session.user);
        } else {
          setUser(null);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, [processUserData]);

  // Authentication timeout to prevent infinite loading
  useEffect(() => {
    if (!authInitialized) {
      const authTimeout = setTimeout(() => {
        if (isLoading) {
          console.log('Authentication timed out. Resetting loading state.');
          setIsLoading(false);
        }
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(authTimeout);
    }
  }, [authInitialized, isLoading]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Logged in successfully!');
      // We don't need to manually set user/session here as the auth state listener will handle it
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed. Please check your credentials and try again.';
      
      // Handle specific error messages for better user feedback
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email before logging in.';
        } else {
          message = error.message;
        }
      }
      
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Check if username is available
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('Username already taken');
      }

      // Create the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      toast.success('Account created successfully!');
      // We don't need to manually set user/session here as the auth state listener will handle it
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.message || 'Signup failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // The auth state listener will handle removing the user
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (error) {
        throw error;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
