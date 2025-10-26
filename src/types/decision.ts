import { type ProcessingStatus } from './enums';

/**
 * Decision data model
 *
 * Represents a user's decision with AI-powered analysis results.
 */
export interface Decision {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: ProcessingStatus;
  decisionType: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  analysisAttempts: number;
  lastAnalyzedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
