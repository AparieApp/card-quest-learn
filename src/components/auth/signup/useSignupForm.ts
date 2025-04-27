
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { signupSchema, SignupFormValues } from './validation';

// Timeout for signup process
const SIGNUP_TIMEOUT_MS = 20000; // 20 seconds

export const useSignupForm = (onSuccess?: () => void) => {
  const { signup, checkUsernameAvailability } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Debounced username availability check
  const checkUsername = debounce(async (username: string) => {
    if (username.length < 3) return;
    
    setUsernameStatus('checking');
    const isAvailable = await checkUsernameAvailability(username);
    setUsernameStatus(isAvailable ? 'available' : 'taken');
  }, 500);

  // Form submission handler
  const onSubmit = async (values: SignupFormValues) => {
    if (usernameStatus === 'taken') {
      toast.error('Username is already taken');
      return;
    }
    
    setError(null);
    
    try {
      setIsSubmitting(true);
      
      const signupTimeout = setTimeout(() => {
        if (isSubmitting) {
          setIsSubmitting(false);
          setError('Signup attempt timed out. Please try again.');
          toast.error('Signup attempt timed out');
        }
      }, SIGNUP_TIMEOUT_MS);
      
      await signup(values.email, values.username, values.password);
      
      clearTimeout(signupTimeout);
      
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    usernameStatus,
    error,
    onSubmit,
    checkUsername
  };
};
