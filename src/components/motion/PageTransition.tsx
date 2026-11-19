import { ViewTransition, type ReactNode } from 'react';

/** `view-transition-class` of the incoming and outgoing page (styled in globals.css). */
export const PAGE_ENTER = 'page-enter';
export const PAGE_EXIT = 'page-exit';

/**
 * Wraps the body of a page so client navigations crossfade it with React's
 * `<ViewTransition>`: the old page fades out where it was, the new one fades
 * in. It lives in each page, not in the layout: layouts persist across
 * navigations, so enter and exit would never fire there.
 *
 * Only the page content takes part. The layout's header (named `site-header`
 * in CSS so it stays put above the snapshots) and footer stay live. Browsers
 * without the View Transitions API get the plain swap, and
 * `prefers-reduced-motion: reduce` turns the animation off in globals.css.
 * `default="none"` keeps every other transition (Suspense reveals,
 * `router.refresh()`, in-page updates) from animating the page.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={PAGE_ENTER} exit={PAGE_EXIT} default="none">
      {children}
    </ViewTransition>
  );
}
