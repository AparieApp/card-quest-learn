import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { EmailLoginFormValues } from './validation';
import { UseFormReturn } from 'react-hook-form';

interface EmailLoginFormProps {
  form: UseFormReturn<EmailLoginFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: EmailLoginFormValues) => Promise<void>;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  form,
  isSubmitting,
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
              <FormLabel className="text-responsive-sm">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your@email.com" 
                  autoComplete="email" 
                  className="btn-mobile-optimized text-base" 
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
              <FormLabel className="text-responsive-sm">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password" 
                  className="btn-mobile-optimized text-base" 
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
          className="w-full bg-flashcard-primary hover:bg-flashcard-primary/90 btn-mobile-optimized btn-responsive-padding text-responsive-base mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-responsive-base">Logging in...</span>
            </>
          ) : (
            <span className="text-responsive-base">Login</span>
          )}
        </Button>
      </form>
    </Form>
  );
};
