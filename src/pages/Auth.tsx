
import React, { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import Layout from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, authInitialized } = useAuth();
  
  // Check if there's a redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  useEffect(() => {
    if (authInitialized && isAuthenticated && !isLoading) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, authInitialized, navigate, redirectTo]);

  // Show loading spinner while initializing auth
  if (!authInitialized || isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  // If already authenticated, don't render the auth form
  if (isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <AuthForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
    </Layout>
  );
};

export default Auth;
