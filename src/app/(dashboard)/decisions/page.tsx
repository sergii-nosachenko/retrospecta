'use client';

import { DecisionsPageContent } from '@/components/decisions/DecisionsPageContent';
import { DecisionsProvider } from '@/contexts/DecisionsContext';

export default function DecisionsPage() {
  return (
    <DecisionsProvider>
      <DecisionsPageContent />
    </DecisionsProvider>
  );
}
