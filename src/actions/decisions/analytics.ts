'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ProcessingStatus } from '@/types/enums';

import { type ActionResult } from './crud';

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
