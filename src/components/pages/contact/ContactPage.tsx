import NextLink from 'next/link';

import { PageTransition } from '@/components/motion/PageTransition';
import type { ContactContent, Locale } from '@/content';
import type { ContactFormUi } from '@/content/es/contact';

import { PageIntro } from '../shared/PageIntro';
import { ContactForm } from './ContactForm';

interface ContactPageProps {
  locale: Locale;
  content: ContactContent;
  ui: ContactFormUi;
  /** Signed render timestamp for the form's anti-spam check. */
  formToken: string;
}

/**
 * Contact: the single conversion point of the site. The form, the first-layer
 * data protection notice under it (RGPD art. 13) and what happens next.
 */
export function ContactPage({ locale, content, ui, formToken }: ContactPageProps) {
  const { hero, nextSteps, form, privacyNotice } = content;

  return (
    <PageTransition>
      <PageIntro kicker={hero.kicker} title={hero.title} lead={hero.lead} />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:gap-14">
        <div className="grid content-start gap-10">
          <section
            aria-labelledby="contact-form-title"
            className="grid gap-5 rounded-[14px] border border-line bg-surface p-5 sm:p-8"
          >
            <h2
              id="contact-form-title"
              className="font-display text-2xl leading-tight font-extrabold tracking-[-0.02em]"
            >
              {form.title}
            </h2>
            <ContactForm
              locale={locale}
              form={form}
              ui={ui}
              privacyHref={privacyNotice.link.href}
              token={formToken}
            />
          </section>

          <section aria-labelledby="contact-privacy-title" className="grid gap-3 text-sm">
            <h2 id="contact-privacy-title" className="font-semibold">
              {privacyNotice.title}
            </h2>
            <dl className="grid gap-2 text-text-muted sm:grid-cols-[max-content_1fr] sm:gap-x-4">
              {privacyNotice.items.map((item) => (
                <div key={item.label} className="contents">
                  <dt className="font-medium text-text">{item.label}</dt>
                  <dd className="mb-1 sm:mb-0">{item.text}</dd>
                </div>
              ))}
            </dl>
            <p>
              <NextLink
                href={privacyNotice.link.href}
                className="underline underline-offset-4 hover:text-accent-strong"
              >
                {privacyNotice.link.label}
              </NextLink>
            </p>
          </section>
        </div>

        <aside aria-labelledby="contact-next-title" className="lg:pt-2">
          <div className="grid gap-4 lg:sticky lg:top-24">
            <h2
              id="contact-next-title"
              className="font-display text-xl leading-tight font-extrabold tracking-[-0.02em]"
            >
              {nextSteps.title}
            </h2>
            <ol className="grid gap-4">
              {nextSteps.items.map((item, index) => (
                <li key={item} className="grid grid-cols-[auto_1fr] items-baseline gap-3">
                  <span aria-hidden="true" className="font-mono text-xs text-accent-strong">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
