
import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UsernameLoginFormValues } from './validation';
import { UseFormReturn } from 'react-hook-form';

interface UsernameLoginFormProps {
  form: UseFormReturn<UsernameLoginFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: UsernameLoginFormValues) => Promise<void>;
}

export const UsernameLoginForm: React.FC<UsernameLoginFormProps> = ({
  form,
  isSubmitting,
  onSubmit
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
  );
};
