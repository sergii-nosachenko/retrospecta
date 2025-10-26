import { generateObject } from 'ai';

import { geminiModel, verifyAIConfig } from './client';
import { createAnalysisPrompt } from './prompts';
import { type DecisionAnalysis, analysisSchema } from './schema';

/**
 * Input data for decision analysis
 */
export interface AnalyzeDecisionInput {
  situation: string;
  decision: string;
  reasoning?: string | null;
}

/**
 * Result of decision analysis
 */
export interface AnalyzeDecisionResult {
  success: boolean;
  data?: DecisionAnalysis;
  error?: string;
}

/**
 * Analyzes a decision using Google Gemini AI
 * Returns structured analysis including category, biases, alternatives, and insights
 *
 * @param input - Decision data to analyze
 * @returns Analysis result with typed data or error
 */
export async function analyzeDecision(
  input: AnalyzeDecisionInput
): Promise<AnalyzeDecisionResult> {
  try {
    // Verify API configuration
    verifyAIConfig();

    // Validate input
    if (!input.situation?.trim()) {
      return {
        success: false,
        error: 'Situation description is required',
      };
    }

    if (!input.decision?.trim()) {
      return {
        success: false,
        error: 'Decision description is required',
      };
    }

    // Generate the analysis prompt
    const prompt = createAnalysisPrompt(input);

    // Call Gemini with structured output
    const { object } = await generateObject({
      model: geminiModel,
      schema: analysisSchema,
      prompt,
      temperature: 0.5, // Balanced creativity and consistency
    });

    return {
      success: true,
      data: object,
    };
  } catch (error) {
    console.error('Decision analysis failed:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // API key missing
      if (error.message.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
        return {
          success: false,
          error: 'AI service is not configured. Please contact support.',
        };
      }

      // Rate limit or API errors
      if (
        error.message.includes('rate limit') ||
        error.message.includes('quota')
      ) {
        return {
          success: false,
          error:
            'AI service is temporarily unavailable. Please try again later.',
        };
      }

      return {
        success: false,
        error: `Analysis failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred during analysis',
    };
  }
}

/**
 * Test function to verify AI integration is working
 */
export async function testAIIntegration(): Promise<boolean> {
  try {
    const testResult = await analyzeDecision({
      situation: 'I was choosing between two job offers',
      decision: 'I chose the higher-paying job in a different city',
      reasoning: 'The salary difference was significant',
    });

    return testResult.success === true;
  } catch (error) {
    console.error('AI integration test failed:', error);
    return false;
  }
}
