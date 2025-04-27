
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { emailLoginSchema, usernameLoginSchema, EmailLoginFormValues, UsernameLoginFormValues } from './validation';

// Login timeout duration (milliseconds)
const LOGIN_TIMEOUT_MS = 15000;

export const useLoginForm = (onSuccess?: () => void) => {
  const { login, loginWithUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create forms with validation
  const emailForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const usernameForm = useForm<UsernameLoginFormValues>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Handle login form timeout
  const handleLoginTimeout = () => {
    if (isSubmitting) {
      setIsSubmitting(false);
      setError('Login attempt timed out. Please try again.');
      toast.error('Login attempt timed out');
      timeoutRef.current = null;
    }
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Email login handler
  const onSubmitEmail = async (values: EmailLoginFormValues) => {
    setError(null);
    clearTimeoutIfExists();
    
    try {
      setIsSubmitting(true);
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
      await login(values.email, values.password);
      clearTimeoutIfExists();
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      clearTimeoutIfExists();
      setIsSubmitting(false);
    }
  };

  // Username login handler
  const onSubmitUsername = async (values: UsernameLoginFormValues) => {
    setError(null);
    clearTimeoutIfExists();
    
    try {
      setIsSubmitting(true);
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
      await loginWithUsername(values.username, values.password);
      clearTimeoutIfExists();
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      clearTimeoutIfExists();
      setIsSubmitting(false);
    }
  };

  // Helper to clear timeout
  const clearTimeoutIfExists = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    emailForm,
    usernameForm,
    isSubmitting,
    error,
    setError,
    loginMethod,
    setLoginMethod,
    onSubmitEmail,
    onSubmitUsername,
    clearTimeoutIfExists
  };
};
