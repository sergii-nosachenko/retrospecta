import { DecisionCategory } from '@prisma/client';
import { z } from 'zod';

/**
 * Schema for LLM decision analysis output
 * Ensures structured, type-safe responses from the AI
 */
export const analysisSchema = z.object({
  category: z
    .nativeEnum(DecisionCategory)
    .describe(
      'The primary category that best describes this decision-making approach'
    ),
  biases: z
    .array(z.string())
    .min(0)
    .max(5)
    .describe(
      'List of cognitive biases identified in the decision-making process (0-5 biases)'
    ),
  alternatives: z
    .string()
    .describe(
      'Thoughtful analysis of overlooked alternatives or paths not considered'
    ),
  insights: z
    .string()
    .describe(
      'Additional insights, patterns, or observations about the decision-making process'
    ),
});

export type DecisionAnalysis = z.infer<typeof analysisSchema>;

/**
 * Common cognitive biases for reference
 */
export const COMMON_BIASES = [
  'Confirmation Bias',
  'Anchoring Bias',
  'Availability Heuristic',
  'Sunk Cost Fallacy',
  'Overconfidence Bias',
  'Hindsight Bias',
  'Status Quo Bias',
  'Recency Bias',
  'Optimism Bias',
  'Loss Aversion',
  'Framing Effect',
  'Bandwagon Effect',
  'Dunning-Kruger Effect',
  'Fundamental Attribution Error',
] as const;
