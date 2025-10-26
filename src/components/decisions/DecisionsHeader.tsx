import { Badge, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { Logo } from '@/components/common/Logo';
import { UserMenu } from '@/components/common/UserMenu';
import { DecisionFormModal } from '@/components/decisions/DecisionFormModal';
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
}

export const DecisionsHeader = memo(
  ({ pendingCount, user, onSignOut }: DecisionsHeaderProps) => {
    const { t } = useTranslations();

    return (
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'start', sm: 'center' }}
        mb={0}
        gap={4}
      >
        <Stack direction="row" align="center" gap={3} flexWrap="wrap">
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
          <DecisionFormModal />
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
