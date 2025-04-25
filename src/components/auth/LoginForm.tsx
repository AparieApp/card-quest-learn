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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const emailForm = useForm<{
    email: string;
    password: string;
  }>({
    resolver: zodResolver(z.object({
      email: z.string().email('Please enter a valid email'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const usernameForm = useForm<{
    username: string;
    password: string;
  }>({
    resolver: zodResolver(z.object({
      username: z.string().min(3, 'Please enter your username'),
      password: z.string().min(6, 'Password must be at least 6 characters')
    })),
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
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      setIsSubmitting(true);
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
      await login(values.email, values.password);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  };

  const onSubmitUsername = async (values: UsernameLoginFormValues) => {
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    try {
      setIsSubmitting(true);
      timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
      await loginWithUsername(values.username, values.password);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-flashcard-dark">Login</h1>
        <p className="text-sm text-muted-foreground mt-2">Welcome back to Aparie!</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-100">
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
            <form onSubmit={emailForm.handleSubmit(async (values) => {
              setError(null);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              try {
                setIsSubmitting(true);
                timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
                await login(values.email, values.password);
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                onSuccess?.();
              } catch (error: any) {
                setError(error.message || 'An error occurred during login');
              } finally {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                setIsSubmitting(false);
              }
            })} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your@email.com" 
                        autoComplete="email" 
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
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        autoComplete="current-password" 
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="username" className="mt-4">
          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(async (values) => {
              setError(null);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              try {
                setIsSubmitting(true);
                timeoutRef.current = setTimeout(handleLoginTimeout, LOGIN_TIMEOUT_MS);
                await loginWithUsername(values.username, values.password);
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                onSuccess?.();
              } catch (error: any) {
                setError(error.message || 'An error occurred during login');
              } finally {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }
                setIsSubmitting(false);
              }
            })} className="space-y-4">
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        autoComplete="username" 
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
                control={usernameForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        autoComplete="current-password" 
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-sm pt-2">
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
