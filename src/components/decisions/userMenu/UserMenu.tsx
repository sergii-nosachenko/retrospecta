'use client';

import { Avatar, Group, IconButton, Separator, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { memo } from 'react';
import { LuChartBar, LuLogOut, LuMoon, LuSun } from 'react-icons/lu';

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

import { useColorMode } from '../../ui/color-mode';

/**
 * User menu component with authentication and theme controls
 *
 * Displays a dropdown menu triggered by the user's avatar with:
 * - User information (name, email)
 * - Link to dashboard
 * - Theme toggle (light/dark mode)
 * - Sign out action
 *
 * @param user - Current user information
 * @param onSignOut - Callback to handle sign out action
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{ id: '123', name: 'John', email: 'john@example.com', avatarUrl: null }}
 *   onSignOut={handleSignOut}
 * />
 * ```
 */
interface UserMenuProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  onSignOut: () => void;
}

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md';
}

const UserAvatar = memo(({ name, avatarUrl, size = 'sm' }: UserAvatarProps) => (
  <Avatar.Root
    size={size}
    css={{
      width: size === 'sm' ? '32px' : '40px',
      height: size === 'sm' ? '32px' : '40px',
    }}
  >
    <Avatar.Fallback name={name} />
    {avatarUrl && <Avatar.Image src={avatarUrl} />}
  </Avatar.Root>
));

UserAvatar.displayName = 'UserAvatar';

const UserMenuTrigger = memo(
  ({ name, avatarUrl }: { name: string; avatarUrl: string | null }) => {
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

const UserInfoHeader = memo(({ user }: { user: UserMenuProps['user'] }) => (
  <MenuItem
    value="user-info"
    css={{
      flexDirection: 'column',
      alignItems: 'flex-start',
      cursor: 'default',
      _hover: { bg: 'transparent' },
      py: 3,
      px: 3,
    }}
    closeOnSelect={false}
  >
    <Group gap={3} alignItems="center" width="full">
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
      <div>
        <Text fontWeight="semibold" fontSize="sm" lineHeight="1.4">
          {user.name}
        </Text>
        <Text
          fontSize="xs"
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          lineHeight="1.4"
        >
          {user.email}
        </Text>
      </div>
    </Group>
  </MenuItem>
));

UserInfoHeader.displayName = 'UserInfoHeader';

const DashboardMenuItem = memo(() => {
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

const ThemeToggleMenuItem = memo(
  ({ colorMode, onToggle }: { colorMode: string; onToggle: () => void }) => {
    const { t } = useTranslations();

    return (
      <MenuItem
        value="theme"
        onClick={onToggle}
        closeOnSelect={false}
        css={{
          py: 2,
          px: 3,
          cursor: 'pointer',
        }}
      >
        <Group gap={3} alignItems="center">
          {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
          <Text fontSize="sm">
            {colorMode === 'dark'
              ? t('common.theme.lightMode')
              : t('common.theme.darkMode')}
          </Text>
        </Group>
      </MenuItem>
    );
  }
);

ThemeToggleMenuItem.displayName = 'ThemeToggleMenuItem';

const SignOutMenuItem = memo(({ onSignOut }: { onSignOut: () => void }) => {
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

export const UserMenu = memo(({ user, onSignOut }: UserMenuProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <UserMenuTrigger name={user.name} avatarUrl={user.avatarUrl} />

      <MenuContent minW="240px">
        <UserInfoHeader user={user} />

        <Separator my={1} />

        <DashboardMenuItem />

        <ThemeToggleMenuItem colorMode={colorMode} onToggle={toggleColorMode} />

        <Separator my={1} />

        <SignOutMenuItem onSignOut={onSignOut} />
      </MenuContent>
    </MenuRoot>
  );
});

UserMenu.displayName = 'UserMenu';
