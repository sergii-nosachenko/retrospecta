'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/constants/routes';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import {
  type CreateDecisionInput,
  createDecisionSchema,
} from '@/lib/utils/validation';
import { ProcessingStatus, SortField, SortOrder } from '@/types/enums';

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
        name:
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      },
      create: {
        id: user.id,
        email: user.email!,
        name:
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      },
    });

    // Create decision with PENDING status
    const newDecision = await prisma.decision.create({
      data: {
        userId: user.id,
        situation,
        decision,
        reasoning: reasoning ?? null,
        status: ProcessingStatus.PENDING,
      },
      select: {
        id: true,
      },
    });

    // Revalidate decisions page
    revalidatePath(ROUTES.DECISIONS);

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
  sortBy: SortField = SortField.CREATED_AT,
  sortOrder: SortOrder = SortOrder.DESC
): Promise<
  ActionResult<
    {
      id: string;
      situation: string;
      decision: string;
      reasoning: string | null;
      status: string;
      decisionType: string | null;
      biases: string[];
      alternatives: string | null;
      insights: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[]
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
        decisionType: true,
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
    decisionType: string | null;
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

/**
 * Deletes a decision by ID
 * Ensures the decision belongs to the authenticated user
 *
 * @param decisionId - ID of the decision to delete
 * @returns Action result indicating success or error
 */
export async function deleteDecision(
  decisionId: string
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
        error: 'You must be logged in to delete a decision',
      };
    }

    // Fetch decision to verify ownership
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
        error: 'You do not have permission to delete this decision',
      };
    }

    // Delete the decision
    await prisma.decision.delete({
      where: {
        id: decisionId,
      },
    });

    // Revalidate decisions page
    revalidatePath(ROUTES.DECISIONS);

    return {
      success: true,
      data: { id: decisionId },
    };
  } catch (error) {
    console.error('Error deleting decision:', error);
    return {
      success: false,
      error: 'Failed to delete decision. Please try again.',
    };
  }
}

/**
 * Dashboard analytics data types
 */
export interface DashboardAnalytics {
  totalDecisions: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  failedAnalyses: number;
  decisionTypeDistribution: { name: string; value: number }[];
  biasDistribution: { name: string; count: number }[];
  statusDistribution: { name: string; value: number }[];
  recentDecisions: number; // Last 7 days
}

/**
 * Gets dashboard analytics for the authenticated user
 * Aggregates decision data for visualization
 *
 * @returns Action result with analytics data or error
 */
export async function getDashboardAnalytics(): Promise<
  ActionResult<DashboardAnalytics>
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
        error: 'You must be logged in to view analytics',
      };
    }

    // Get all user decisions
    const decisions = await prisma.decision.findMany({
      where: {
        userId: user.id,
      },
      select: {
        status: true,
        decisionType: true,
        biases: true,
        createdAt: true,
      },
    });

    // Calculate total counts
    const totalDecisions = decisions.length;
    const completedAnalyses = decisions.filter(
      (d) => d.status === ProcessingStatus.COMPLETED
    ).length;
    const pendingAnalyses = decisions.filter(
      (d) =>
        d.status === ProcessingStatus.PENDING ||
        d.status === ProcessingStatus.PROCESSING
    ).length;
    const failedAnalyses = decisions.filter(
      (d) => d.status === ProcessingStatus.FAILED
    ).length;

    // Calculate recent decisions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDecisions = decisions.filter(
      (d) => d.createdAt >= sevenDaysAgo
    ).length;

    // Decision type distribution (only completed analyses)
    const decisionTypeMap = new Map<string, number>();
    decisions.forEach((d) => {
      if (d.decisionType && d.status === ProcessingStatus.COMPLETED) {
        const count = decisionTypeMap.get(d.decisionType) ?? 0;
        decisionTypeMap.set(d.decisionType, count + 1);
      }
    });

    const decisionTypeDistribution = [...decisionTypeMap.entries()].map(
      ([name, value]) => ({
        name: name
          .split('_')
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' '),
        value,
      })
    );

    // Bias distribution (flatten all biases and count)
    const biasMap = new Map<string, number>();
    decisions.forEach((d) => {
      if (
        d.biases &&
        d.biases.length > 0 &&
        d.status === ProcessingStatus.COMPLETED
      ) {
        d.biases.forEach((bias) => {
          const count = biasMap.get(bias) ?? 0;
          biasMap.set(bias, count + 1);
        });
      }
    });

    // Get top 10 biases
    const biasDistribution = [...biasMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Status distribution
    const statusMap = new Map<string, number>();
    decisions.forEach((d) => {
      const count = statusMap.get(d.status) ?? 0;
      statusMap.set(d.status, count + 1);
    });

    const statusDistribution = [...statusMap.entries()].map(
      ([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
      })
    );

    const analytics: DashboardAnalytics = {
      totalDecisions,
      completedAnalyses,
      pendingAnalyses,
      failedAnalyses,
      decisionTypeDistribution,
      biasDistribution,
      statusDistribution,
      recentDecisions,
    };

    return {
      success: true,
      data: analytics,
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return {
      success: false,
      error: 'Failed to fetch analytics. Please try again.',
    };
  }
}
