'use client';

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface BaseModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal title */
  title: React.ReactNode;
  /** Modal size - defaults to responsive sizing (full on mobile, xl on desktop) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Padding variant - 'compact' for detail views, 'comfortable' for forms */
  paddingVariant?: 'compact' | 'comfortable';
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Modal body content */
  children: React.ReactNode;
  /** Whether to show the close trigger button */
  showCloseTrigger?: boolean;
  /** Optional trigger element to open the modal */
  trigger?: React.ReactNode;
}

/**
 * Reusable modal wrapper with consistent structure and styling
 *
 * Features:
 * - Responsive sizing (full-screen on mobile, sized on desktop)
 * - Consistent padding patterns
 * - Mobile-optimized with safe-area support
 * - Inside scroll behavior
 * - Two padding variants for different use cases
 *
 * @example
 * ```tsx
 * <BaseModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Modal Title"
 *   paddingVariant="compact"
 *   footer={<FooterButtons />}
 * >
 *   <ModalContent />
 * </BaseModal>
 * ```
 */
export const BaseModal = ({
  open,
  onOpenChange,
  title,
  size = 'xl',
  paddingVariant = 'compact',
  footer,
  children,
  showCloseTrigger = true,
  trigger,
}: BaseModalProps) => {
  // Determine padding based on variant
  const padding =
    paddingVariant === 'comfortable' ? { base: 4, md: 6 } : { base: 3, md: 4 };

  const footerPaddingBottom =
    paddingVariant === 'comfortable'
      ? { base: 'max(1rem, env(safe-area-inset-bottom))', md: 6 }
      : { base: 'max(1rem, env(safe-area-inset-bottom))', md: 4 };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: 'full', sm: 'lg', md: size }}
      scrollBehavior="inside"
      placement="center"
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        h={{ base: 'auto', smDown: 'fit-content' }}
        maxH={{ base: '90dvh', smDown: '100dvh' }}
        minH={{ base: 'auto', smDown: '100dvh' }}
      >
        <DialogHeader py={padding} px={{ base: 4, md: 6 }}>
          <DialogTitle>{title}</DialogTitle>
          {showCloseTrigger && <DialogCloseTrigger />}
        </DialogHeader>

        <DialogBody py={padding} px={{ base: 4, md: 6 }}>
          {children}
        </DialogBody>

        {footer && (
          <DialogFooter
            py={padding}
            px={{ base: 4, md: 6 }}
            pb={footerPaddingBottom}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </DialogRoot>
  );
};

BaseModal.displayName = 'BaseModal';
