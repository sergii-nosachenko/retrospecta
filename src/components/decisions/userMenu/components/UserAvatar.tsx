import { Avatar } from '@chakra-ui/react';
import { memo } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md';
}

/**
 * User avatar component
 *
 * Displays a user avatar with fallback to initials.
 *
 * @param name - User's full name (used for fallback initials)
 * @param avatarUrl - URL to user's avatar image (optional)
 * @param size - Avatar size ('sm' or 'md', defaults to 'sm')
 */
export const UserAvatar = memo(
  ({ name, avatarUrl, size = 'sm' }: UserAvatarProps) => (
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
  )
);

UserAvatar.displayName = 'UserAvatar';
