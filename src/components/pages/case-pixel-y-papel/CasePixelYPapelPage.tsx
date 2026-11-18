import Image, { type StaticImageData } from 'next/image';

import type { CaseStudyContent, Link as ContentLink, Locale } from '@/content';

import { CardGrid, ContentSection, DiamondList, Prose } from '../service/ContentSection';
import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';
import { caseLabels } from './labels';

/** A screenshot of the product, once the partners provide and approve one. */
export interface CaseImage {
  src: StaticImageData;
  /** Describes what the image shows; required, never empty. */
  alt: string;
  caption?: string;
}

interface CasePixelYPapelPageProps {
  locale: Locale;
  content: CaseStudyContent;
  /** Optional gallery: rendered only when there is at least one image. */
  gallery?: readonly CaseImage[];
}

/** Link to the live product: opens in a new tab and says so. */
function ExternalLink({ link, newTab }: { link: ContentLink; newTab: string }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary inline-flex items-center gap-2 font-semibold"
    >
      {link.label}
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="size-3">
        <path d="M4 2h6v6M10 2 2 10" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

/**
 * Píxel y Papel case study: context, challenge, solution, role, result and
 * stack, written qualitatively as the partners approved it (no figures, no
 * screenshots). A gallery can be added later through the `gallery` prop.
 */
export function CasePixelYPapelPage({ locale, content, gallery }: CasePixelYPapelPageProps) {
  const labels = caseLabels[locale];
  const { context, challenge, solution, role, result, stack } = content;

  return (
    <>
      <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead}>
        <dl className="mt-4 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {content.facts.map((fact) => (
            <div key={fact.label} className="grid content-start gap-1 bg-surface p-4">
              <dt className="font-mono text-[11px] tracking-[0.12em] text-text-muted uppercase">
                {fact.label}
              </dt>
              <dd className="font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2">
          <ExternalLink link={content.link} newTab={labels.newTab} />
        </p>
      </PageIntro>

      <ContentSection id="case-context" title={context.title}>
        <Prose paragraphs={context.paragraphs} />
      </ContentSection>

      <ContentSection id="case-challenge" title={challenge.title}>
        <Prose paragraphs={challenge.paragraphs} />
        <DiamondList items={challenge.items} />
      </ContentSection>

      <ContentSection id="case-solution" title={solution.title}>
        <Prose paragraphs={solution.paragraphs} />
        <CardGrid items={solution.items} />
      </ContentSection>

      <ContentSection id="case-role" title={role.title}>
        <div className="border-l-2 border-accent pl-5">
          <Prose paragraphs={role.paragraphs} />
        </div>
      </ContentSection>

      <ContentSection id="case-result" title={result.title}>
        <Prose paragraphs={result.paragraphs} />
      </ContentSection>

      {gallery && gallery.length > 0 && (
        <ContentSection id="case-gallery" title={labels.gallery}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <li key={image.alt}>
                <figure className="grid gap-2">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full rounded-[14px] border border-line"
                  />
                  {image.caption && (
                    <figcaption className="text-sm text-text-muted">{image.caption}</figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </ContentSection>
      )}

      <ContentSection id="case-stack" title={stack.title}>
        <ul className="flex flex-wrap gap-2">
          {stack.items.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[13px]"
            >
              {item}
            </li>
          ))}
        </ul>
        <p>
          <ExternalLink link={content.link} newTab={labels.newTab} />
        </p>
      </ContentSection>

      <CtaSection cta={content.cta} />
    </>
  );
}
