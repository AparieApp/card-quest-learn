
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailLoginForm } from './EmailLoginForm';
import { UsernameLoginForm } from './UsernameLoginForm';
import { useLoginForm } from './useLoginForm';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitch
}) => {
  const {
    emailForm,
    usernameForm,
    isSubmitting,
    error,
    loginMethod,
    setLoginMethod,
    onSubmitEmail,
    onSubmitUsername
  } = useLoginForm(onSuccess);

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
          <EmailLoginForm 
            form={emailForm}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitEmail}
          />
        </TabsContent>
        
        <TabsContent value="username" className="mt-4">
          <UsernameLoginForm 
            form={usernameForm}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitUsername}
          />
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
