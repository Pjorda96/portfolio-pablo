import Image from 'next/image';

import avatar from '@/assets/avatar.webp';
import { PageTransition } from '@/components/motion/PageTransition';
import { owner, type AboutContent, type Locale } from '@/content';

import { CARD, DiamondList, SECTION, SectionHeading, TEXT_LINK } from '../home/primitives';
import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';

interface AboutPageProps {
  locale: Locale;
  content: AboutContent;
}

/**
 * About: who Pablo is (portrait and intro), the sectors he has worked in
 * (no company names), how he works, his specialties and the practical side
 * of working together, closing on the contact CTA.
 */
export function AboutPage({ content }: AboutPageProps) {
  const { hero, intro, profiles, experience, specialties, quality, working } = content;

  return (
    <PageTransition>
      <PageIntro kicker={hero.kicker} title={hero.title} lead={hero.lead} />

      <div className={`${SECTION} pt-0 sm:pt-0 md:grid-cols-[minmax(0,240px)_1fr] md:items-start`}>
        <Image
          src={avatar}
          alt={content.avatarAlt}
          sizes="(min-width: 768px) 240px, 160px"
          placeholder="blur"
          loading="eager"
          className="size-40 rounded-full border border-line bg-surface object-cover md:size-60"
        />
        <div className="grid max-w-[64ch] gap-4 text-lg">
          {intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-base text-text-muted">
            <span>{profiles.label}</span>
            <a href={owner.profiles.github} rel="me noopener" target="_blank" className={TEXT_LINK}>
              GitHub
            </a>
            <a
              href={owner.profiles.linkedin}
              rel="me noopener"
              target="_blank"
              className={TEXT_LINK}
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>

      <section aria-labelledby="experiencia-title" className={SECTION}>
        <SectionHeading id="experiencia-title" title={experience.title} intro={experience.text} />
        <ul className="grid gap-4 md:grid-cols-3">
          {experience.sectors.map((s) => (
            <li key={s.title} className={`${CARD} grid content-start gap-2`}>
              <h3 className="font-display text-xl leading-tight font-bold">{s.title}</h3>
              <p className="text-text-muted">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como-trabajo-title" className={SECTION}>
        <SectionHeading id="como-trabajo-title" title={quality.title} intro={quality.intro} />
        <ul className="grid gap-4 sm:grid-cols-2">
          {quality.items.map((q) => (
            <li key={q.title} className="grid content-start gap-2 border-t border-line pt-4">
              <h3 className="flex items-center gap-2 font-display text-xl leading-tight font-bold">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rotate-45 rounded-[1px] bg-accent"
                />
                {q.title}
              </h3>
              <p className="text-text-muted">{q.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className={`${SECTION} md:grid-cols-2`}>
        <section
          aria-labelledby="especialidades-title"
          className={`${CARD} grid content-start gap-4`}
        >
          <h2
            id="especialidades-title"
            className="font-display text-2xl leading-tight font-extrabold tracking-[-0.01em]"
          >
            {specialties.title}
          </h2>
          <DiamondList items={specialties.items} />
        </section>
        <section aria-labelledby="trabajemos-title" className={`${CARD} grid content-start gap-4`}>
          <h2
            id="trabajemos-title"
            className="font-display text-2xl leading-tight font-extrabold tracking-[-0.01em]"
          >
            {working.title}
          </h2>
          <DiamondList items={working.items} />
        </section>
      </div>

      <CtaSection cta={content.cta} />
    </PageTransition>
  );
}
