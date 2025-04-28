
import { toast } from 'sonner';
import { ValidationError, AuthError } from '@/utils/errorHandling';
import { checkRateLimit } from '@/utils/secureValidation';

export const handleLoginError = (error: any): string => {
  console.error('Login error:', error);
  let message = 'Login failed. Please check your credentials and try again.';
  
  // Check rate limiting
  if (!checkRateLimit('login', 5, 60000)) {
    toast.error('Too many login attempts. Please try again later.');
    throw new AuthError('Too many login attempts. Please try again later.');
  }
  
  // Handle specific error messages for better user feedback
  // but don't expose internal details
  if (error.message) {
    if (error.message.includes('Invalid login credentials')) {
      message = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Please verify your email before logging in.';
    } else {
      // Generic message for any other error
      message = 'Authentication error. Please try again.';
    }
  }
  
  toast.error(message);
  throw new AuthError(message, error);
};

export const handleSignupError = (error: any): string => {
  console.error('Signup error:', error);
  let message = 'Signup failed. Please try again.';
  
  // Check rate limiting
  if (!checkRateLimit('signup', 3, 300000)) {
    toast.error('Too many signup attempts. Please try again later.');
    throw new AuthError('Too many signup attempts. Please try again later.');
  }
  
  // Handle specific signup errors
  if (error.message) {
    if (error.message.includes('already registered')) {
      // Don't confirm if email exists for security
      message = 'Signup failed. Please try again with different credentials.';
    } else if (error.message.includes('Username already taken')) {
      message = 'This username is already taken. Please choose another one.';
    } else {
      // Generic message for any other error
      message = 'Registration error. Please try again.';
    }
  }
  
  toast.error(message);
  throw new AuthError(message, error);
};
