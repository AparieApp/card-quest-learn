
import { z } from 'zod';

export const cardSchema = z.object({
  front_text: z.string().min(1, 'Question is required'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  manual_incorrect_answers: z.array(z.string()).max(3, 'Maximum 3 manual incorrect answers'),
});

export type CardFormValues = z.infer<typeof cardSchema>;
