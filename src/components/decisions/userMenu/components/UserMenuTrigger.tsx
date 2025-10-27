import { IconButton } from '@chakra-ui/react';
import { memo } from 'react';

import { MenuTrigger } from '@/components/ui/menu';
import { useTranslations } from '@/translations';

import { UserAvatar } from './UserAvatar';

interface UserMenuTriggerProps {
  name: string;
  avatarUrl: string | null;
}

/**
 * User menu trigger button component
 *
 * Displays a clickable avatar button that triggers the user menu dropdown.
 *
 * @param name - User's name for avatar fallback
 * @param avatarUrl - URL to user's avatar image
 */
export const UserMenuTrigger = memo(
  ({ name, avatarUrl }: UserMenuTriggerProps) => {
    const { t } = useTranslations();

    return (
      <MenuTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={t('common.menu.userMenu')}
          css={{
            borderRadius: 'full',
            _hover: {
              bg: 'gray.100',
              _dark: {
                bg: 'gray.700',
              },
            },
          }}
        >
          <UserAvatar name={name} avatarUrl={avatarUrl} size="sm" />
        </IconButton>
      </MenuTrigger>
    );
  }
);

UserMenuTrigger.displayName = 'UserMenuTrigger';
