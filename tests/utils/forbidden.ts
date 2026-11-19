/**
 * Words the public output must never contain: no prices, no employers, no
 * part-time work, no unfilled placeholders. Mirrors the list checked against
 * the content tree in tests/content.test.ts, plus any `{{…}}` placeholder,
 * for generated output (metadata, JSON-LD, llms.txt).
 */
export const FORBIDDEN_OUTPUT = [
  'media jornada',
  'tiempo parcial',
  'part-time',
  'part time',
  '€',
  'precio',
  'price',
  'tarifa',
  'Cognizant',
  'Allfunds',
  'everis',
  'NTT',
  'revolucionari',
  'sinergia',
  'synergy',
  '{{',
] as const;

/** Forbidden words found in `text`, case-insensitive. */
export const forbiddenIn = (text: string): string[] =>
  FORBIDDEN_OUTPUT.filter((word) => text.toLowerCase().includes(word.toLowerCase()));
