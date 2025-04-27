
import { z } from 'zod';

// Login form validation schemas
export const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const usernameLoginSchema = z.object({
  username: z.string().min(3, 'Please enter your username'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Type definitions for form values
export type EmailLoginFormValues = z.infer<typeof emailLoginSchema>;
export type UsernameLoginFormValues = z.infer<typeof usernameLoginSchema>;
