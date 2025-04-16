
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Check if there's a redirect parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  const handleAuthSuccess = () => {
    navigate(redirectTo);
  };

  return (
    <Layout>
      <div className="container py-12 flex flex-col items-center justify-center min-h-screen">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </Layout>
  );
};

export default Auth;
