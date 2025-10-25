'use server';

import { revalidatePath } from 'next/cache';

import { analyzeDecision as runAIAnalysis } from '@/lib/ai/analyzer';
import { prisma } from '@/lib/prisma';

import type { ActionResult } from './decisions';

/**
 * Analyzes a decision using AI and updates the database
 * This should be called after creating a decision
 *
 * @param decisionId - ID of the decision to analyze
 * @returns Action result indicating success or failure
 */
export async function analyzeDecision(
  decisionId: string
): Promise<ActionResult<void>> {
  try {
    // Get decision data
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!decision) {
      return {
        success: false,
        error: 'Decision not found',
      };
    }

    // Update status to PROCESSING
    await prisma.decision.update({
      where: { id: decisionId },
      data: { status: 'PROCESSING' },
    });

    // Revalidate to show processing status
    revalidatePath('/decisions');
    revalidatePath(`/decisions/${decisionId}`);

    // Run AI analysis
    const analysisResult = await runAIAnalysis({
      situation: decision.situation,
      decision: decision.decision,
      reasoning: decision.reasoning,
    });

    if (!analysisResult.success || !analysisResult.data) {
      // Update status to FAILED
      await prisma.decision.update({
        where: { id: decisionId },
        data: {
          status: 'FAILED',
          errorMessage: analysisResult.error || 'Analysis failed',
          analysisAttempts: { increment: 1 },
        },
      });

      revalidatePath('/decisions');
      revalidatePath(`/decisions/${decisionId}`);

      return {
        success: false,
        error: analysisResult.error || 'Analysis failed',
      };
    }

    // Update decision with analysis results
    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: 'COMPLETED',
        category: analysisResult.data.category,
        biases: analysisResult.data.biases,
        alternatives: analysisResult.data.alternatives,
        insights: analysisResult.data.insights,
        lastAnalyzedAt: new Date(),
        analysisAttempts: { increment: 1 },
        errorMessage: null,
      },
    });

    // Revalidate to show completed analysis
    revalidatePath('/decisions');
    revalidatePath(`/decisions/${decisionId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error analyzing decision:', error);

    // Update status to FAILED
    try {
      await prisma.decision.update({
        where: { id: decisionId },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          analysisAttempts: { increment: 1 },
        },
      });

      revalidatePath('/decisions');
      revalidatePath(`/decisions/${decisionId}`);
    } catch (updateError) {
      console.error('Error updating decision status:', updateError);
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Re-analyzes an existing decision
 * Resets the decision status and triggers a new analysis
 *
 * @param decisionId - ID of the decision to re-analyze
 * @returns Action result indicating success or failure
 */
export async function reanalyzeDecision(
  decisionId: string
): Promise<ActionResult<void>> {
  try {
    // Reset decision status
    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: 'PENDING',
        errorMessage: null,
      },
    });

    revalidatePath('/decisions');
    revalidatePath(`/decisions/${decisionId}`);

    // Trigger new analysis
    return await analyzeDecision(decisionId);
  } catch (error) {
    console.error('Error re-analyzing decision:', error);
    return {
      success: false,
      error: 'Failed to re-analyze decision. Please try again.',
    };
  }
}
