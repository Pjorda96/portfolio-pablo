import { describe, expect, it } from 'vitest';

import { getContent, LOCALES } from '@/content';
import { buildSystemPrompt, serializeSiteContent } from '@/lib/assistant/system-prompt';

describe.each(LOCALES)('assistant system prompt (%s)', (locale) => {
  const c = getContent(locale);
  const prompt = buildSystemPrompt(locale);

  it('is deterministic: the same bytes on every build (cacheable prefix)', () => {
    expect(buildSystemPrompt(locale)).toBe(prompt);
    expect(serializeSiteContent(c)).toBe(serializeSiteContent(getContent(locale)));
  });

  it('carries no per-request data such as dates or ids', () => {
    expect(prompt).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(prompt).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i);
  });

  it('includes the services, case study, about, FAQ and contact copy', () => {
    for (const s of c.services.items) {
      expect(prompt).toContain(s.name);
      expect(prompt).toContain(s.summary.text);
      for (const f of s.faq.items) expect(prompt).toContain(f.answer);
    }
    expect(prompt).toContain(c.casePixelYPapel.hero.lead);
    expect(prompt).toContain(c.casePixelYPapel.role.paragraphs[0]);
    expect(prompt).toContain(c.about.intro[0]);
    for (const f of c.faq.items) {
      expect(prompt).toContain(f.question);
      expect(prompt).toContain(f.answer);
    }
    for (const step of c.home.process.steps) expect(prompt).toContain(step.text);
    for (const step of c.contact.nextSteps.items) expect(prompt).toContain(step);
    expect(prompt).toContain(`https://pablojorda.es${c.meta.routes.contact}`);
  });

  it('leaves the legal texts out', () => {
    expect(prompt).not.toContain(c.legal.privacy.sections[0]!.paragraphs[0] ?? '§');
  });

  it('states the guard rails: scope, no prices, no invented facts, co-founder', () => {
    expect(prompt).toMatch(/Answer only with information found in <site_content>/);
    expect(prompt).toMatch(/Out of scope/);
    expect(prompt).toMatch(/publishes no prices/);
    expect(prompt).toMatch(/Never invent clients/);
    expect(prompt).toMatch(/four partners .* co-founder and technical lead/);
    expect(prompt).toMatch(/Never present him as its sole owner/);
    expect(prompt).toMatch(/employers/);
  });

  it('wraps the content after the instructions', () => {
    expect(prompt.indexOf('<site_content>')).toBeGreaterThan(prompt.indexOf('Rules:'));
    expect(prompt.trimEnd().endsWith('</site_content>')).toBe(true);
  });
});

it('builds a different prompt per locale', () => {
  expect(buildSystemPrompt('es')).not.toBe(buildSystemPrompt('en'));
  expect(buildSystemPrompt('es')).toMatch(/"tú"/);
});
