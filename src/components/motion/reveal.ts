/**
 * Class of a block that fades and rises in as it scrolls into view.
 *
 * Pure CSS (globals.css): a scroll-driven animation on a `view()` timeline,
 * applied only inside `@supports (animation-timeline: view())` and
 * `prefers-reduced-motion: no-preference`. Content is never hidden by
 * default, so it is fully visible without JavaScript, before hydration and in
 * browsers without scroll-driven animations; only opacity and translate
 * change, so it causes no layout shift.
 */
export const REVEAL = 'reveal';
