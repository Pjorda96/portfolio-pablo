import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { PAGE_ENTER, PAGE_EXIT, PageTransition } from '@/components/motion/PageTransition';
import { REVEAL } from '@/components/motion/reveal';
import { SECTION } from '@/components/pages/home/primitives';
import { ContentSection } from '@/components/pages/service/ContentSection';
import { CtaSection } from '@/components/pages/shared/CtaSection';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

/**
 * Every rule of a stylesheet whose selector contains `selector`, with the
 * preludes of the at-rules that enclose it (outermost first). A tiny brace
 * walker: enough for our own globals.css, not a general CSS parser.
 */
function rulesFor(source: string, selector: string) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const stack: string[] = [];
  const found: { context: string[]; body: string }[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      const prelude = text.slice(start, i).trim();
      if (!prelude.startsWith('@') && prelude.includes(selector)) {
        const end = text.indexOf('}', i);
        found.push({ context: [...stack], body: text.slice(i + 1, end) });
      }
      stack.push(prelude);
      start = i + 1;
    } else if (ch === '}') {
      stack.pop();
      start = i + 1;
    } else if (ch === ';') {
      start = i + 1;
    }
  }
  return found;
}

describe('PageTransition', () => {
  it('renders its children as they are, with no wrapper element', () => {
    const { container } = render(
      <PageTransition>
        <p>uno</p>
        <p>dos</p>
      </PageTransition>,
    );
    expect(container.innerHTML).toBe('<p>uno</p><p>dos</p>');
  });

  it('styles its enter and exit classes in globals.css', () => {
    expect(rulesFor(css, `::view-transition-new(.${PAGE_ENTER})`)).toHaveLength(1);
    expect(rulesFor(css, `::view-transition-old(.${PAGE_EXIT})`)).toHaveLength(1);
  });

  it('turns view-transition animations off with prefers-reduced-motion', () => {
    const [rule] = rulesFor(css, '::view-transition-new(*)');
    expect(rule?.context).toContain('@media (prefers-reduced-motion: reduce)');
    expect(rule?.body).toMatch(/animation:\s*none\s*!important/);
  });

  it('keeps the header out of the page animation', () => {
    for (const pseudo of ['group', 'new']) {
      const [rule] = rulesFor(css, `::view-transition-${pseudo}(site-header)`);
      expect(rule?.body).toMatch(/animation:\s*none/);
    }
  });
});

describe('scroll reveal', () => {
  it('only animates with motion allowed and scroll-driven animations supported', () => {
    const rules = rulesFor(css, `.${REVEAL}`);
    expect(rules.length).toBeGreaterThan(0);
    for (const { context } of rules) {
      expect(context.some((c) => c.includes('prefers-reduced-motion: no-preference'))).toBe(true);
      expect(context).toContain('@supports (animation-timeline: view())');
    }
  });

  it('never hides content outside the animation (visible without JS or support)', () => {
    for (const { body } of rulesFor(css, `.${REVEAL}`)) {
      expect(body).not.toMatch(/opacity|visibility|display/);
    }
  });

  it('animates only opacity and translate, so nothing shifts the layout', () => {
    const keyframes = css.match(/@keyframes reveal-in\s*{([\s\S]*?)}\s*}/)?.[1] ?? '';
    const properties = [...keyframes.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    expect(properties.length).toBeGreaterThan(0);
    expect(new Set(properties)).toEqual(new Set(['opacity', 'translate']));
  });

  it('marks the content sections of every page', () => {
    expect(SECTION.split(' ')).toContain(REVEAL);

    const { container } = render(
      <>
        <ContentSection id="t" title="Título">
          <p>texto</p>
        </ContentSection>
        <CtaSection
          cta={{ title: 'Hablemos', text: 'Texto', cta: { href: '/contacto', label: 'Contacto' } }}
        />
      </>,
    );
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(2);
    for (const section of sections) expect(section).toHaveClass(REVEAL);
  });
});

describe('smooth scroll', () => {
  it('only glides with motion allowed', () => {
    const smooth = rulesFor(css, 'html').filter(({ body }) =>
      /scroll-behavior:\s*smooth/.test(body),
    );
    expect(smooth).toHaveLength(1);
    expect(smooth[0]?.context).toContain('@media (prefers-reduced-motion: no-preference)');
  });
});
