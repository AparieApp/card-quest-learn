
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SignupFormFields } from './SignupFormFields';
import { useSignupForm } from './useSignupForm';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitch }) => {
  const {
    form,
    isSubmitting,
    usernameStatus,
    error,
    onSubmit,
    checkUsername
  } = useSignupForm(onSuccess);

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
      
      <SignupFormFields 
        form={form}
        isSubmitting={isSubmitting}
        usernameStatus={usernameStatus}
        onUsernameChange={checkUsername}
        onSubmit={onSubmit}
      />
      
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
