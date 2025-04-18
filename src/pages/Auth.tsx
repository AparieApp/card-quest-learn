
import React, { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if there's a redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    console.log('Auth component: isAuthenticated =', isAuthenticated, 'isLoading =', isLoading);
    
    if (!isLoading && isAuthenticated) {
      console.log('Auth component: Redirecting to', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);
  
  const handleAuthSuccess = () => {
    console.log('Auth component: Auth success, redirecting to', redirectTo);
    navigate(redirectTo, { replace: true });
  };

  // Show loading spinner while checking authentication, but with a timeout
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </Layout>
    );
  }

  // If already authenticated, don't render the auth form (prevents flash before redirect)
  if (isAuthenticated) {
    return (
      <Layout>
        <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-flashcard-primary" />
          <p className="mt-4 text-muted-foreground">Authentication successful, redirecting...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </Layout>
  );
};

export default Auth;
