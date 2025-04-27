
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UsernameAvailability } from './UsernameAvailability';
import { SignupFormValues } from './validation';
import { UseFormReturn } from 'react-hook-form';

interface SignupFormFieldsProps {
  form: UseFormReturn<SignupFormValues>;
  isSubmitting: boolean;
  usernameStatus: 'checking' | 'available' | 'taken' | null;
  onUsernameChange: (username: string) => void;
  onSubmit: (values: SignupFormValues) => Promise<void>;
}

export const SignupFormFields: React.FC<SignupFormFieldsProps> = ({
  form,
  isSubmitting,
  usernameStatus,
  onUsernameChange,
  onSubmit
}) => {
  return (
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
                      onUsernameChange(e.target.value);
                    }}
                  />
                  <UsernameAvailability 
                    status={usernameStatus} 
                    username={field.value} 
                  />
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
  );
};
