import { Badge, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { Logo } from '@/components/common/Logo';
import { DecisionFormModal } from '@/components/decisions/modals/DecisionFormModal';
import { UserMenu } from '@/components/decisions/userMenu/UserMenu';
import { useTranslations } from '@/translations';

interface DecisionsHeaderProps {
  pendingCount: number;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  onSignOut: () => void;
  onDecisionCreated?: () => void;
}

/**
 * Header component for the decisions page
 *
 * Displays:
 * - Application logo
 * - "My Decisions" heading
 * - Pending analysis count badge
 * - "New Decision" button (opens form modal)
 * - User menu (with sign out and theme controls)
 *
 * Memoized to prevent unnecessary re-renders.
 *
 * @param pendingCount - Number of decisions currently being analyzed
 * @param user - Current user information (null if loading)
 * @param onSignOut - Callback to handle user sign out
 * @param onDecisionCreated - Optional callback after successful decision creation
 *
 * @example
 * ```tsx
 * <DecisionsHeader
 *   pendingCount={2}
 *   user={currentUser}
 *   onSignOut={handleSignOut}
 *   onDecisionCreated={refreshList}
 * />
 * ```
 */
export const DecisionsHeader = memo(
  ({
    pendingCount,
    user,
    onSignOut,
    onDecisionCreated,
  }: DecisionsHeaderProps) => {
    const { t } = useTranslations();

    return (
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify={{ base: 'center', sm: 'space-between' }}
        align={{ base: 'center', sm: 'center' }}
        mb={0}
        gap={4}
      >
        <Stack
          direction="row"
          align="center"
          gap={3}
          flexWrap="wrap"
          justify={{ base: 'center', sm: 'flex-start' }}
        >
          <Logo size="2xl" />
          <Heading size="2xl">{t('decisions.header.title')}</Heading>

          {/* Pending count indicator */}
          {pendingCount > 0 && (
            <Badge colorPalette="blue" size="sm" variant="subtle" px={3} py={1}>
              {t('decisions.header.analyzingCount', { count: pendingCount })}
            </Badge>
          )}
        </Stack>

        <Stack direction="row" align="center" gap={2}>
          <DecisionFormModal onSuccess={onDecisionCreated} />
          {user ? (
            <UserMenu user={user} onSignOut={onSignOut} />
          ) : (
            <Skeleton width="32px" height="32px" borderRadius="full" />
          )}
        </Stack>
      </Stack>
    );
  }
);

DecisionsHeader.displayName = 'DecisionsHeader';
