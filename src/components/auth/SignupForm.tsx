
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitch: () => void;
}

const SIGNUP_TIMEOUT_MS = 20000; // 20 seconds

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitch }) => {
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

  const checkUsername = debounce(async (username: string) => {
    if (username.length < 3) return;
    
    setUsernameStatus('checking');
    const isAvailable = await checkUsernameAvailability(username);
    setUsernameStatus(isAvailable ? 'available' : 'taken');
  }, 500);

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

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-flashcard-dark">Create an Account</h1>
        <p className="text-sm text-muted-foreground mt-2">Start creating and learning with flashcards</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-100">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your@email.com" 
                    className="h-12 text-base" 
                    disabled={isSubmitting}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="username" 
                      className="h-12 text-base pr-24"
                      disabled={isSubmitting}
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        checkUsername(e.target.value);
                      }}
                    />
                    {usernameStatus && field.value.length >= 3 && (
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                        usernameStatus === 'checking' ? 'text-orange-500' :
                        usernameStatus === 'available' ? 'text-green-500' : 'text-red-500'
                      } bg-white/80 px-2 py-1 rounded-full`}>
                        {usernameStatus === 'checking' ? 'Checking...' : 
                         usernameStatus === 'available' ? 'Available' : 'Taken'}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 text-base" 
                    disabled={isSubmitting}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 text-base" 
                    disabled={isSubmitting}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-flashcard-primary hover:bg-flashcard-primary/90 h-12 text-base mt-6"
            disabled={isSubmitting || usernameStatus === 'taken'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : 'Create Account'}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm pt-2">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" onClick={onSwitch} className="p-0 h-auto text-flashcard-primary">
            Log in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
