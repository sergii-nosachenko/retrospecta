import { Group, Text } from '@chakra-ui/react';
import { memo } from 'react';
import { LuLogOut } from 'react-icons/lu';

import { MenuItem } from '@/components/ui/menu';
import { useTranslations } from '@/translations';

interface SignOutMenuItemProps {
  onSignOut: () => void;
}

/**
 * Sign out menu item component
 *
 * Provides a sign-out action in the user menu with red/destructive styling.
 *
 * @param onSignOut - Callback to handle sign out action
 */
export const SignOutMenuItem = memo(({ onSignOut }: SignOutMenuItemProps) => {
  const { t } = useTranslations();

  return (
    <MenuItem
      value="signout"
      onClick={onSignOut}
      css={{
        py: 2,
        px: 3,
        cursor: 'pointer',
        color: 'red.600',
        _dark: { color: 'red.400' },
        _hover: {
          bg: 'red.50',
          _dark: { bg: 'red.900/20' },
        },
      }}
    >
      <Group gap={3} alignItems="center">
        <LuLogOut />
        <Text fontSize="sm">{t('common.actions.signOut')}</Text>
      </Group>
    </MenuItem>
  );
});

SignOutMenuItem.displayName = 'SignOutMenuItem';
