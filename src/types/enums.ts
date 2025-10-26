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
