
import { z } from 'zod';

export const cardSchema = z.object({
  front_text: z.string().optional(),
  question_image_url: z.string().url().optional().or(z.string().length(0)),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  manual_incorrect_answers: z.array(z.string()).max(3, 'Maximum 3 manual incorrect answers'),
}).refine(data => 
  (data.front_text?.trim() && data.front_text?.trim().length > 0) || 
  (data.question_image_url && data.question_image_url.trim().length > 0), 
{
  message: 'Please provide a question text or upload an image',
  path: ['front_text'],
});

export type CardFormValues = z.infer<typeof cardSchema>;
