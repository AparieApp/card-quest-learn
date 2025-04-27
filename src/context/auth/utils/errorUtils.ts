
import { toast } from 'sonner';

export const handleLoginError = (error: any): string => {
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
  return message;
};

export const handleSignupError = (error: any): string => {
  console.error('Signup error:', error);
  let message = 'Signup failed. Please try again.';
  
  // Handle specific signup errors
  if (error.message) {
    if (error.message.includes('already registered')) {
      message = 'This email is already registered. Try logging in instead.';
    } else if (error.message.includes('Username already taken')) {
      message = 'This username is already taken. Please choose another one.';
    } else {
      message = error.message;
    }
  }
  
  toast.error(message);
  return message;
};
