'use client';

import { IconButton } from '@chakra-ui/react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/menu';

export interface ActionMenuItem {
  /** Unique value for the menu item */
  value: string;
  /** Label text for the action */
  label: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Click handler for the action */
  onClick: (event: React.MouseEvent) => void;
  /** Whether this is a destructive action (red styling) */
  destructive?: boolean;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface ActionMenuProps {
  /** Array of menu items to display */
  items: (ActionMenuItem | 'separator')[];
  /** Size of the trigger button */
  size?: 'sm' | 'md' | 'lg';
  /** Variant of the trigger button */
  variant?: 'ghost' | 'outline' | 'solid';
  /** Menu positioning */
  placement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'top-end'
    | 'top-start'
    | 'bottom'
    | 'top';
  /** Custom trigger button (replaces default three-dot button) */
  trigger?: React.ReactNode;
  /** Whether to stop event propagation on trigger click */
  stopPropagation?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

/**
 * Reusable dropdown action menu component
 *
 * Features:
 * - Consistent three-dot menu trigger (or custom trigger)
 * - Support for icons, destructive actions, separators
 * - Automatic event propagation handling
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * <ActionMenu
 *   items={[
 *     {
 *       value: 'edit',
 *       label: 'Edit',
 *       icon: <EditIcon />,
 *       onClick: handleEdit
 *     },
 *     'separator',
 *     {
 *       value: 'delete',
 *       label: 'Delete',
 *       icon: <DeleteIcon />,
 *       onClick: handleDelete,
 *       destructive: true
 *     }
 *   ]}
 * />
 * ```
 */
export const ActionMenu = ({
  items,
  size = 'sm',
  variant = 'ghost',
  placement = 'bottom-end',
  trigger,
  stopPropagation = true,
  'aria-label': ariaLabel = 'Actions menu',
}: ActionMenuProps) => {
  const handleTriggerClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const defaultTrigger = (
    <IconButton
      variant={variant}
      size={size}
      onClick={handleTriggerClick}
      aria-label={ariaLabel}
    >
      <HiOutlineDotsVertical />
    </IconButton>
  );

  return (
    <MenuRoot positioning={{ placement }}>
      <MenuTrigger asChild>{trigger ?? defaultTrigger}</MenuTrigger>
      <MenuContent minW="150px">
        {items.map((item, index) => {
          // Render separator
          if (item === 'separator') {
            return <MenuSeparator key={`separator-${index}`} />;
          }

          // Render menu item
          return (
            <MenuItem
              key={item.value}
              value={item.value}
              onClick={item.onClick}
              disabled={item.disabled}
              color={item.destructive ? 'red.500' : undefined}
              _dark={item.destructive ? { color: 'red.400' } : undefined}
              gap={2}
              px={3}
              py={2}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          );
        })}
      </MenuContent>
    </MenuRoot>
  );
};

ActionMenu.displayName = 'ActionMenu';
