'use client';

import { Separator } from '@chakra-ui/react';
import { memo } from 'react';

import { useColorMode } from '@/components/ui/color-mode';
import { MenuContent, MenuRoot } from '@/components/ui/menu';

import {
  DashboardMenuItem,
  SignOutMenuItem,
  ThemeToggleMenuItem,
  UserInfoHeader,
  UserMenuTrigger,
} from './components';

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
