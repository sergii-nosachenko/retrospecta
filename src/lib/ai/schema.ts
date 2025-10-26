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
      'Thoughtful analysis of overlooked alternatives or paths not considered. ' +
        'Return complete, well-formatted markdown with blank lines between points. ' +
        'Provide 3-5 substantial alternatives with detailed explanations.'
    ),
  insights: z
    .string()
    .describe(
      'Additional insights, patterns, or observations about the decision-making process. ' +
        'Return complete, well-formatted markdown with blank lines between major points. ' +
        'Provide comprehensive analysis covering strengths, patterns, and growth areas.'
    ),
});

export type DecisionAnalysis = z.infer<typeof analysisSchema>;
