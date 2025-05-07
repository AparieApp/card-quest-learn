import { z } from 'zod';

export const cardSchema = z.object({
  front_text: z.string().optional(),
  question_image_url: z.string().url().optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  manual_incorrect_answers: z.array(z.string()).max(3, 'Maximum 3 manual incorrect answers'),
}).refine(data => data.front_text?.trim() || data.question_image_url, {
  message: 'Please provide a question text or upload an image',
  path: ['front_text'],
});

export type CardFormValues = z.infer<typeof cardSchema>;
