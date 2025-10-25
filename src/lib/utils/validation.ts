import { z } from 'zod';

/**
 * Validation schema for creating a new decision
 */
export const createDecisionSchema = z.object({
  situation: z
    .string()
    .min(10, 'Please provide at least 10 characters describing the situation')
    .max(5000, 'Situation description is too long (max 5000 characters)'),
  decision: z
    .string()
    .min(5, 'Please provide at least 5 characters describing your decision')
    .max(2000, 'Decision description is too long (max 2000 characters)'),
  reasoning: z
    .string()
    .max(3000, 'Reasoning is too long (max 3000 characters)')
    .optional()
    .or(z.literal('')),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;

/**
 * Validation schema for sorting options
 */
export const sortDecisionsSchema = z.object({
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortDecisionsInput = z.infer<typeof sortDecisionsSchema>;
