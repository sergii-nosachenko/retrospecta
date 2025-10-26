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

export type DecisionType =
  | 'EMOTIONAL'
  | 'STRATEGIC'
  | 'IMPULSIVE'
  | 'ANALYTICAL'
  | 'INTUITIVE'
  | 'COLLABORATIVE'
  | 'RISK_AVERSE'
  | 'RISK_TAKING'
  | 'OTHER';

// Legacy export for backwards compatibility
export type DecisionCategory = DecisionType;

export const DECISION_TYPE_ICONS: Record<DecisionType, React.ReactElement> = {
  EMOTIONAL: <LuHeart />,
  STRATEGIC: <LuTarget />,
  IMPULSIVE: <LuZap />,
  ANALYTICAL: <LuBrain />,
  INTUITIVE: <LuLightbulb />,
  COLLABORATIVE: <LuUsers />,
  RISK_AVERSE: <LuShield />,
  RISK_TAKING: <LuRocket />,
  OTHER: <LuSparkles />,
} as const;

export const getDecisionTypeIcon = (
  decisionType: string | null
): React.ReactElement | null => {
  if (!decisionType) return null;
  return DECISION_TYPE_ICONS[decisionType as DecisionType] ?? null;
};

export const getDecisionTypeLabel = (
  decisionType: string | null
): string | null => {
  if (!decisionType) return null;

  return decisionType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Legacy exports for backwards compatibility
export const getCategoryIcon = getDecisionTypeIcon;
export const getCategoryLabel = getDecisionTypeLabel;
