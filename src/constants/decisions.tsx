import {
  LuBrain,
  LuHeart,
  LuLightbulb,
  LuRocket,
  LuShield,
  LuSparkles,
  LuTarget,
  LuUsers,
  LuZap,
} from 'react-icons/lu';

import { DecisionType, ProcessingStatus } from '@/types/enums';

import type { TFunction } from '@/translations';

export { DecisionType };

export const DECISION_TYPE_ICONS: Record<DecisionType, React.ReactElement> = {
  [DecisionType.EMOTIONAL]: <LuHeart />,
  [DecisionType.STRATEGIC]: <LuTarget />,
  [DecisionType.IMPULSIVE]: <LuZap />,
  [DecisionType.ANALYTICAL]: <LuBrain />,
  [DecisionType.INTUITIVE]: <LuLightbulb />,
  [DecisionType.COLLABORATIVE]: <LuUsers />,
  [DecisionType.RISK_AVERSE]: <LuShield />,
  [DecisionType.RISK_TAKING]: <LuRocket />,
  [DecisionType.OTHER]: <LuSparkles />,
} as const;

export const getDecisionTypeIcon = (
  decisionType: string | null
): React.ReactElement | null => {
  if (!decisionType) return null;
  return DECISION_TYPE_ICONS[decisionType as DecisionType] ?? null;
};

export const getDecisionTypeLabel = (
  t: TFunction,
  decisionType: string | null
): string | null => {
  if (!decisionType) return null;

  // Use translations for decision type labels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return t(`decisions.decisionTypes.${decisionType}` as any);
};

/**
 * Get translated label for decision status
 */
export const getStatusLabel = (t: TFunction, status: string | null): string => {
  if (!status) return '';

  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case ProcessingStatus.COMPLETED:
      return t('decisions.list.status.completed');
    case ProcessingStatus.PENDING:
      return t('decisions.list.status.pending');
    case ProcessingStatus.PROCESSING:
      return t('decisions.list.status.processing');
    case ProcessingStatus.FAILED:
      return t('decisions.list.status.failed');
    default:
      return status;
  }
};
