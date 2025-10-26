import { google } from '@ai-sdk/google';

/**
 * Google Gemini AI client configuration
 * Uses Gemini 2.5 Flash model for fast, cost-effective analysis
 * Supports up to 65,536 output tokens for detailed markdown responses
 */
export const geminiModel = google('gemini-2.5-flash');

/**
 * Verify that the Google Gemini API key is configured
 */
export function verifyAIConfig(): void {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      'Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable. ' +
        'Please add it to your .env.local file.'
    );
  }
}
