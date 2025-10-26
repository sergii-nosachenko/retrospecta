import { auth } from './en/auth';
import { common } from './en/common';
import { dashboard } from './en/dashboard';
import { decisions } from './en/decisions';
import { errors } from './en/errors';
import { landing } from './en/landing';
import { toasts } from './en/toasts';
import { validation } from './en/validation';

/**
 * All translations combined into a single object
 */
export const translations = {
  common,
  landing,
  auth,
  decisions,
  dashboard,
  errors,
  validation,
  toasts,
} as const;

/**
 * Type for all translation keys using dot notation
 * Examples: "common.app.name", "decisions.form.title", "auth.login.title"
 */
export type TranslationKey = NestedKeyOf<typeof translations>;

/**
 * Helper type to get nested keys with dot notation from an object
 */
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

/**
 * Helper function to get nested value from object using dot notation
 * @param obj - The object to traverse
 * @param path - Dot-notated path (e.g., "common.app.name")
 * @returns The value at the path, or the path itself if not found
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return;
  }, obj);

  return typeof result === 'string' ? result : path;
}

export type TFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>
) => string;

/**
 * Get translation by key with optional parameter replacement
 *
 * This is the internal translation function used by the useTranslations hook.
 * Do not export or use directly - always use the useTranslations() hook in components
 * and pass the t function as a parameter to utility functions.
 *
 * @param key - Translation key in dot notation (e.g., "common.app.name")
 * @param params - Optional object with parameters to replace in the string
 */
const t: TFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>
): string => {
  let result = getNestedValue(translations, key);

  // Replace parameters in the string (e.g., {count} with actual count value)
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replaceAll(
        new RegExp(`\\{${paramKey}\\}`, 'g'),
        String(paramValue)
      );
    });
  }

  return result;
};

/**
 * React hook for using translations in components
 *
 * **IMPORTANT**: Always use this hook in React components instead of
 * importing the standalone `t` function.
 *
 * @returns Object containing the translation function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t } = useTranslations();
 *   return <h1>{t('common.app.name')}</h1>;
 * }
 * ```
 */
export function useTranslations() {
  return { t };
}

export default translations;
