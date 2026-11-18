'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Renders its (server-rendered) children everywhere except on the home page,
 * whose city brings its own brand chip. Used by the `[locale]` layout, where
 * the home is the only page without a child segment.
 */
export function InnerPagesOnly({ children }: { children: ReactNode }) {
  return useSelectedLayoutSegment() === null ? null : children;
}
