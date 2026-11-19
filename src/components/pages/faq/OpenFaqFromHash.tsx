'use client';

import { useEffect } from 'react';

/**
 * Opens the question a link points at (`/preguntas-frecuentes#plazos`), on
 * load and on later hash changes. Without JavaScript the page still scrolls
 * to the question; the visitor opens it.
 */
export function OpenFaqFromHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);

  return null;
}
