'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import {
  type CreateDecisionInput,
  createDecisionSchema,
} from '@/lib/utils/validation';

/**
 * Result type for server actions
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a new decision for the authenticated user
 * Decision is initially saved with PENDING status
 *
 * @param input - Decision data (situation, decision, reasoning)
 * @returns Action result with created decision or error
 */
export async function createDecision(
  input: CreateDecisionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create a decision',
      };
    }

    // Validate input
    const validationResult = createDecisionSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Invalid input',
      };
    }

    const { situation, decision, reasoning } = validationResult.data;

    // Ensure user exists in our database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
      },
    });

    // Create decision with PENDING status
    const newDecision = await prisma.decision.create({
      data: {
        userId: user.id,
        situation,
        decision,
        reasoning: reasoning || null,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    });

    // Revalidate decisions page
    revalidatePath('/decisions');

    return {
      success: true,
      data: { id: newDecision.id },
    };
  } catch (error) {
    console.error('Error creating decision:', error);
    return {
      success: false,
      error: 'Failed to create decision. Please try again.',
    };
  }
}

/**
 * Gets all decisions for the authenticated user
 * Ordered by creation date (newest first) by default
 *
 * @param sortBy - Field to sort by (default: 'createdAt')
 * @param sortOrder - Sort order (default: 'desc')
 * @returns Action result with list of decisions or error
 */
export async function getUserDecisions(
  sortBy: 'createdAt' | 'updatedAt' | 'status' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<
  ActionResult<
    Array<{
      id: string;
      situation: string;
      decision: string;
      reasoning: string | null;
      status: string;
      category: string | null;
      biases: string[];
      alternatives: string | null;
      insights: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  >
> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view decisions',
      };
    }

    // Fetch user's decisions
    const decisions = await prisma.decision.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        situation: true,
        decision: true,
        reasoning: true,
        status: true,
        category: true,
        biases: true,
        alternatives: true,
        insights: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: decisions,
    };
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return {
      success: false,
      error: 'Failed to fetch decisions. Please try again.',
    };
  }
}

/**
 * Gets a single decision by ID
 * Ensures the decision belongs to the authenticated user
 *
 * @param decisionId - ID of the decision to fetch
 * @returns Action result with decision or error
 */
export async function getDecision(decisionId: string): Promise<
  ActionResult<{
    id: string;
    situation: string;
    decision: string;
    reasoning: string | null;
    status: string;
    category: string | null;
    biases: string[];
    alternatives: string | null;
    insights: string | null;
    analysisAttempts: number;
    lastAnalyzedAt: Date | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view this decision',
      };
    }

    // Fetch decision
    const decision = await prisma.decision.findUnique({
      where: {
        id: decisionId,
      },
    });

    // Check if decision exists
    if (!decision) {
      return {
        success: false,
        error: 'Decision not found',
      };
    }

    // Check if decision belongs to user
    if (decision.userId !== user.id) {
      return {
        success: false,
        error: 'You do not have permission to view this decision',
      };
    }

    return {
      success: true,
      data: decision,
    };
  } catch (error) {
    console.error('Error fetching decision:', error);
    return {
      success: false,
      error: 'Failed to fetch decision. Please try again.',
    };
  }
}
