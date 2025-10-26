'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/constants/routes';
import { analyzeDecision as runAIAnalysis } from '@/lib/ai/analyzer';
import { prisma } from '@/lib/prisma';
import { ProcessingStatus } from '@/types/enums';

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
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!decision) {
      return {
        success: false,
        error: 'Decision not found',
      };
    }

    // Prevent re-analyzing if already processing
    if (decision.status === ProcessingStatus.PROCESSING) {
      console.warn('Decision is already being analyzed:', decisionId);
      return {
        success: false,
        error: 'Analysis already in progress',
      };
    }

    await prisma.decision.update({
      where: { id: decisionId },
      data: { status: ProcessingStatus.PROCESSING },
    });

    revalidatePath(ROUTES.DECISIONS);
    revalidatePath(`${ROUTES.DECISIONS}/${decisionId}`);

    const analysisResult = await runAIAnalysis({
      situation: decision.situation,
      decision: decision.decision,
      reasoning: decision.reasoning,
    });

    if (!analysisResult.success || !analysisResult.data) {
      await prisma.decision.update({
        where: { id: decisionId },
        data: {
          status: ProcessingStatus.FAILED,
          errorMessage: analysisResult.error ?? 'Analysis failed',
          analysisAttempts: { increment: 1 },
        },
      });

      revalidatePath(ROUTES.DECISIONS);
      revalidatePath(`${ROUTES.DECISIONS}/${decisionId}`);

      return {
        success: false,
        error: analysisResult.error ?? 'Analysis failed',
      };
    }

    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: ProcessingStatus.COMPLETED,
        decisionType: analysisResult.data.category,
        biases: analysisResult.data.biases,
        alternatives: analysisResult.data.alternatives,
        insights: analysisResult.data.insights,
        lastAnalyzedAt: new Date(),
        analysisAttempts: { increment: 1 },
        errorMessage: null,
        isNew: true,
      },
    });

    revalidatePath(ROUTES.DECISIONS);
    revalidatePath(`${ROUTES.DECISIONS}/${decisionId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error analyzing decision:', error);

    try {
      await prisma.decision.update({
        where: { id: decisionId },
        data: {
          status: ProcessingStatus.FAILED,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          analysisAttempts: { increment: 1 },
        },
      });

      revalidatePath(ROUTES.DECISIONS);
      revalidatePath(`${ROUTES.DECISIONS}/${decisionId}`);
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
    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        status: ProcessingStatus.PENDING,
        errorMessage: null,
        isNew: true,
      },
    });

    revalidatePath(ROUTES.DECISIONS);
    revalidatePath(`${ROUTES.DECISIONS}/${decisionId}`);

    return await analyzeDecision(decisionId);
  } catch (error) {
    console.error('Error re-analyzing decision:', error);
    return {
      success: false,
      error: 'Failed to re-analyze decision. Please try again.',
    };
  }
}
