import { z } from 'zod';

export const EvalItemSchema = z.object({
  itemId: z.string().min(1),
  prompt: z.string().min(1),
  expectedOutput: z.string().optional(),
});

export const RunEvalRequestSchema = z.object({
  models: z.array(z.string()).min(1),
  item: EvalItemSchema,
});
