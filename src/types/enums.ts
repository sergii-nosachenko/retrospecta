/**
 * Application-wide enum definitions
 * Centralized enums for type safety and better maintainability
 */

// Decision sorting enums
export enum SortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
  DECISION_TYPE = 'decisionType',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// Decision stream event types
export enum StreamEventType {
  UPDATE = 'update',
  PENDING = 'pending',
  ERROR = 'error',
}

// Decision action types
export enum DecisionActionType {
  REANALYZE = 'reanalyze',
  DELETE = 'delete',
}

// Decision types (categories)
export enum DecisionType {
  EMOTIONAL = 'EMOTIONAL',
  STRATEGIC = 'STRATEGIC',
  IMPULSIVE = 'IMPULSIVE',
  ANALYTICAL = 'ANALYTICAL',
  INTUITIVE = 'INTUITIVE',
  COLLABORATIVE = 'COLLABORATIVE',
  RISK_AVERSE = 'RISK_AVERSE',
  RISK_TAKING = 'RISK_TAKING',
  OTHER = 'OTHER',
}

// Decision processing status
export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// UI status values
export enum StatusValue {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Color mode (theme)
export enum ColorMode {
  LIGHT = 'light',
  DARK = 'dark',
}

// Cognitive biases that may be detected in decision analysis
export enum CognitiveBias {
  CONFIRMATION_BIAS = 'CONFIRMATION_BIAS',
  ANCHORING_BIAS = 'ANCHORING_BIAS',
  AVAILABILITY_HEURISTIC = 'AVAILABILITY_HEURISTIC',
  SUNK_COST_FALLACY = 'SUNK_COST_FALLACY',
  RECENCY_BIAS = 'RECENCY_BIAS',
  OVERCONFIDENCE_BIAS = 'OVERCONFIDENCE_BIAS',
  HINDSIGHT_BIAS = 'HINDSIGHT_BIAS',
  STATUS_QUO_BIAS = 'STATUS_QUO_BIAS',
  LOSS_AVERSION = 'LOSS_AVERSION',
  FRAMING_EFFECT = 'FRAMING_EFFECT',
  GROUPTHINK = 'GROUPTHINK',
  AUTHORITY_BIAS = 'AUTHORITY_BIAS',
  BANDWAGON_EFFECT = 'BANDWAGON_EFFECT',
  DUNNING_KRUGER_EFFECT = 'DUNNING_KRUGER_EFFECT',
  OPTIMISM_BIAS = 'OPTIMISM_BIAS',
  NEGATIVITY_BIAS = 'NEGATIVITY_BIAS',
  FUNDAMENTAL_ATTRIBUTION_ERROR = 'FUNDAMENTAL_ATTRIBUTION_ERROR',
}
