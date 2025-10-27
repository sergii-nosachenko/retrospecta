import { Group, Text } from '@chakra-ui/react';
import { memo } from 'react';

import { MenuItem } from '@/components/ui/menu';

import { UserAvatar } from './UserAvatar';

interface UserInfoHeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}

/**
 * User information header in menu
 *
 * Displays user avatar, name, and email at the top of the user menu dropdown.
 * This is a non-interactive menu item that serves as a header.
 *
 * @param user - User information object
 */
export const UserInfoHeader = memo(({ user }: UserInfoHeaderProps) => (
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
