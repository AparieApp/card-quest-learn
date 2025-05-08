import { z } from 'zod';

export const cardSchema = z.object({
  front_text: z.string().min(1, 'Front text is required'),
  question_image_url: z.string().optional(),
  question_type: z.enum(['single-choice', 'multiple-select']),
  correct_answer: z.string().optional(),
  correct_answers: z.array(z.string().min(1, "Correct answer text cannot be empty.")).optional(),
  manual_incorrect_answers: z.array(z.string()).optional(), // Users can add up to 3 incorrect answers
}).superRefine((data, ctx) => {
  if (data.question_type === 'single-choice') {
    if (!data.correct_answer || data.correct_answer.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correct answer is required for single-choice questions.',
        path: ['correct_answer'],
      });
    }
    // Optionally ensure correct_answers is not populated for single-choice
    if (data.correct_answers && data.correct_answers.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multiple correct answers should not be provided for single-choice questions.',
        path: ['correct_answers'], // Or path: ['question_type'] to indicate a mismatch
      });
    }
  } else if (data.question_type === 'multiple-select') {
    if (!data.correct_answers || data.correct_answers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one correct answer is required for multiple-select questions.',
        path: ['correct_answers'],
      });
    }
    // Optionally ensure correct_answer is not populated for multiple-select
    if (data.correct_answer && data.correct_answer.trim() !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Single correct answer should not be provided for multiple-select questions.',
        path: ['correct_answer'], // Or path: ['question_type']
      });
    }
  }
});

export type CardFormValues = z.infer<typeof cardSchema>;
