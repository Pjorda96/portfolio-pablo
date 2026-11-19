import { Inter_Tight, JetBrains_Mono, Syne } from 'next/font/google';

/**
 * Type pairing of "La ciudad": Syne for display (wide, architectural),
 * Inter Tight for text, JetBrains Mono for coordinates, the clock and
 * labels. Self-hosted by next/font at build time; no request reaches Google.
 */
export const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
});

export const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false,
});

export const fontVariables = [syne.variable, interTight.variable, jetbrainsMono.variable].join(' ');
