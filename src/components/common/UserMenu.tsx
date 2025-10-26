'use client';

import { memo, useCallback } from 'react';
import { LuChartBar, LuLogOut, LuMoon, LuSun } from 'react-icons/lu';

import Link from 'next/link';

import { Avatar, Group, IconButton, Separator, Text } from '@chakra-ui/react';

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu';

import { useColorMode } from '../ui/color-mode';

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
  ({ name, avatarUrl }: { name: string; avatarUrl: string | null }) => (
    <MenuTrigger asChild>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="User menu"
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
  )
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

const DashboardMenuItem = memo(() => (
  <MenuItem
    value="dashboard"
    asChild
    css={{
      py: 2,
      px: 3,
      cursor: 'pointer',
    }}
  >
    <Link href="/decisions/dashboard">
      <Group gap={3} alignItems="center">
        <LuChartBar />
        <Text fontSize="sm">Dashboard</Text>
      </Group>
    </Link>
  </MenuItem>
));

DashboardMenuItem.displayName = 'DashboardMenuItem';

const ThemeToggleMenuItem = memo(
  ({ colorMode, onToggle }: { colorMode: string; onToggle: () => void }) => {
    const handleClick = useCallback(() => {
      onToggle();
    }, [onToggle]);

    return (
      <MenuItem
        value="theme"
        onClick={handleClick}
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
            {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </Group>
      </MenuItem>
    );
  }
);

ThemeToggleMenuItem.displayName = 'ThemeToggleMenuItem';

const SignOutMenuItem = memo(({ onSignOut }: { onSignOut: () => void }) => {
  const handleClick = useCallback(() => {
    onSignOut();
  }, [onSignOut]);

  return (
    <MenuItem
      value="signout"
      onClick={handleClick}
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
        <Text fontSize="sm">Sign Out</Text>
      </Group>
    </MenuItem>
  );
});

SignOutMenuItem.displayName = 'SignOutMenuItem';

export const UserMenu = memo(({ user, onSignOut }: UserMenuProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const handleToggleColorMode = useCallback(() => {
    toggleColorMode();
  }, [toggleColorMode]);

  const handleSignOut = useCallback(() => {
    onSignOut();
  }, [onSignOut]);

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
      <UserMenuTrigger name={user.name} avatarUrl={user.avatarUrl} />

      <MenuContent minW="240px">
        <UserInfoHeader user={user} />

        <Separator my={1} />

        <DashboardMenuItem />

        <ThemeToggleMenuItem
          colorMode={colorMode}
          onToggle={handleToggleColorMode}
        />

        <Separator my={1} />

        <SignOutMenuItem onSignOut={handleSignOut} />
      </MenuContent>
    </MenuRoot>
  );
});

UserMenu.displayName = 'UserMenu';
