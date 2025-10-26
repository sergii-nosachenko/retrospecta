'use client';

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

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <MenuRoot positioning={{ placement: 'bottom-end' }}>
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
          <Avatar.Root
            size="sm"
            css={{
              width: '32px',
              height: '32px',
            }}
          >
            <Avatar.Fallback name={user.name} />
            {user.avatarUrl && <Avatar.Image src={user.avatarUrl} />}
          </Avatar.Root>
        </IconButton>
      </MenuTrigger>

      <MenuContent minW="240px">
        {/* User Info Header */}
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
            <Avatar.Root
              size="md"
              css={{
                width: '40px',
                height: '40px',
              }}
            >
              <Avatar.Fallback name={user.name} />
              {user.avatarUrl && <Avatar.Image src={user.avatarUrl} />}
            </Avatar.Root>
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

        <Separator my={1} />

        {/* Dashboard Link */}
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

        {/* Theme Toggle */}
        <MenuItem
          value="theme"
          onClick={toggleColorMode}
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

        <Separator my={1} />

        {/* Sign Out */}
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
            <Text fontSize="sm">Sign Out</Text>
          </Group>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
