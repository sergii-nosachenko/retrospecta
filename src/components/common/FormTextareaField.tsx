'use client';

import { Textarea } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';

export interface FormTextareaFieldProps {
  /** Field label */
  label: string;
  /** Field value */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text displayed below the field */
  helperText?: string;
  /** Error message to display */
  errorText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Number of rows (default: 6) */
  rows?: number;
  /** Minimum height (default: 150px) */
  minH?: string;
  /** Maximum height (default: 150px) */
  maxH?: string;
  /** Whether to autofocus the field */
  autoFocus?: boolean;
}

/**
 * Standardized form textarea field with consistent styling
 *
 * Combines Field (label, helper text, error) with Textarea (input area)
 * and applies the project's standard textarea styling.
 *
 * Features:
 * - Fixed height (150px) for consistent form appearance
 * - Standard padding and rows
 * - Support for validation errors
 * - Character count (via maxLength)
 * - Autofocus support
 *
 * @example
 * ```tsx
 * <FormTextareaField
 *   label="Situation"
 *   value={situation}
 *   onChange={handleChange}
 *   placeholder="Describe the context..."
 *   helperText="Provide details about the situation"
 *   required
 *   maxLength={5000}
 * />
 * ```
 */
export const FormTextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  errorText,
  required = false,
  disabled = false,
  maxLength,
  rows = 6,
  minH = '150px',
  maxH = '150px',
  autoFocus = false,
}: FormTextareaFieldProps) => {
  return (
    <Field
      label={label}
      required={required}
      helperText={helperText}
      errorText={errorText}
      invalid={Boolean(errorText)}
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        minH={minH}
        maxH={maxH}
        disabled={disabled}
        maxLength={maxLength}
        p={3}
        autoFocus={autoFocus}
      />
    </Field>
  );
};

FormTextareaField.displayName = 'FormTextareaField';
