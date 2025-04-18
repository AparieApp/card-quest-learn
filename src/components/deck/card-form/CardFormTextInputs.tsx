
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { CardFormValues } from './types';

interface CardFormTextInputsProps {
  form: UseFormReturn<CardFormValues>;
  isSubmitting: boolean;
}

export const CardFormTextInputs = ({ form, isSubmitting }: CardFormTextInputsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="front_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter the question or front side text"
                className="min-h-20"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="correct_answer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correct Answer</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter the correct answer" 
                {...field} 
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
