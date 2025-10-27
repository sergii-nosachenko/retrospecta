import { Group, Text } from '@chakra-ui/react';
import { memo } from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

import { MenuItem } from '@/components/ui/menu';
import { useTranslations } from '@/translations';

interface ThemeToggleMenuItemProps {
  colorMode: string;
  onToggle: () => void;
}

/**
 * Theme toggle menu item component
 *
 * Provides a theme switcher control in the user menu to toggle between light and dark modes.
 *
 * @param colorMode - Current color mode ('light' or 'dark')
 * @param onToggle - Callback to toggle the color mode
 */
export const ThemeToggleMenuItem = memo(
  ({ colorMode, onToggle }: ThemeToggleMenuItemProps) => {
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
