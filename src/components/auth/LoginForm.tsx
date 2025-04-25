
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const emailLoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const usernameLoginSchema = z.object({
  username: z.string().min(3, 'Please enter your username'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type EmailLoginFormValues = z.infer<typeof emailLoginSchema>;
type UsernameLoginFormValues = z.infer<typeof usernameLoginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitch: () => void;
}

const LOGIN_TIMEOUT_MS = 15000; // 15 seconds

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitch
}) => {
  const { login, loginWithUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout if component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const handleLoginTimeout = () => {
    if (isSubmitting) {
      setIsSubmitting(false);
      setError('Login attempt timed out. Please try again.');
      toast.error('Login attempt timed out');
      timeoutRef.current = null;
      console.log('LoginForm: Login timeout');
    }
  };

  const onSubmitEmail = async (values: EmailLoginFormValues) => {
    // Clear any previous errors
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      setIsSubmitting(true);
      console.log('LoginForm: Attempting login with email...');

      // Set a timeout to prevent hanging on login indefinitely
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);

      // Attempt login
      await login(values.email, values.password);
      console.log('LoginForm: Login successful');

      // Clear timeout as login succeeded
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Call onSuccess callback
      onSuccess?.();
    } catch (error: any) {
      console.log('LoginForm: Login failed', error);
      // Error is handled in the auth context
      setError(error.message || 'An error occurred during login');
    } finally {
      // Clear timeout if it's still active
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  };

  const onSubmitUsername = async (values: UsernameLoginFormValues) => {
    // Clear any previous errors
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      setIsSubmitting(true);
      console.log('LoginForm: Attempting login with username...');

      // Set a timeout to prevent hanging on login indefinitely
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);

      // Attempt login with username
      await loginWithUsername(values.username, values.password);
      console.log('LoginForm: Login successful');

      // Clear timeout as login succeeded
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Call onSuccess callback
      onSuccess?.();
    } catch (error: any) {
      console.log('LoginForm: Login failed', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      // Clear timeout if it's still active
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-muted-foreground mt-2">Welcome back to Aparie!</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'email' | 'username')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="username">Username</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="mt-4">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-flashcard-primary hover:bg-flashcard-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="username" className="mt-4">
          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(onSubmitUsername)} className="space-y-4">
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={usernameForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-flashcard-primary hover:bg-flashcard-secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <Button variant="link" onClick={onSwitch} className="p-0 h-auto text-flashcard-primary">
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
