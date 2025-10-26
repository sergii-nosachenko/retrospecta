/**
 * Decision actions module
 *
 * This module provides server actions for managing decisions and analytics.
 * It is organized into two main categories:
 *
 * - CRUD operations (crud.ts): Create, read, update, and delete decisions
 * - Analytics operations (analytics.ts): Dashboard analytics and aggregations
 */

// Re-export CRUD operations
export {
  createDecision,
  getUserDecisions,
  getDecision,
  deleteDecision,
  type ActionResult,
} from './crud';

// Re-export analytics operations
export { getDashboardAnalytics, type DashboardAnalytics } from './analytics';
