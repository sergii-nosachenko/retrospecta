import { Group, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { memo } from 'react';
import { LuChartBar } from 'react-icons/lu';

import { MenuItem } from '@/components/ui/menu';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

/**
 * Dashboard menu item component
 *
 * Provides a link to the dashboard page in the user menu.
 */
export const DashboardMenuItem = memo(() => {
  const { t } = useTranslations();

  return (
    <MenuItem
      value="dashboard"
      asChild
      css={{
        py: 2,
        px: 3,
        cursor: 'pointer',
      }}
    >
      <Link href={ROUTES.DECISIONS_DASHBOARD}>
        <Group gap={3} alignItems="center">
          <LuChartBar />
          <Text fontSize="sm">{t('common.navigation.dashboard')}</Text>
        </Group>
      </Link>
    </MenuItem>
  );
});

DashboardMenuItem.displayName = 'DashboardMenuItem';
