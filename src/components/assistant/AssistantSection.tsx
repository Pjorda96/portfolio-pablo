import { getContent, type Locale } from '@/content';
import { Link } from '@/i18n/navigation';
import { paths } from '@/i18n/routing';
import { isAssistantConfigured } from '@/lib/assistant/availability';

import { Arrow, SECTION, SectionHeading, TEXT_LINK } from '../pages/home/primitives';
import { AssistantChat } from './AssistantChat';

/**
 * Home section of the AI assistant ("ask me about my services"), a live demo
 * of the AI solutions service. Server-rendered shell; the chat is a client
 * island that talks to `POST /api/assistant`.
 *
 * Without `ANTHROPIC_API_KEY` the section is left out entirely: a "live demo"
 * that only says it is unavailable would undersell the service. The home is
 * prerendered, so adding the key takes a redeploy to show it.
 */
export function AssistantSection({ locale }: { locale: Locale }) {
  if (!isAssistantConfigured()) return null;
  const { assistant } = getContent(locale);

  return (
    <section
      id="asistente"
      aria-labelledby="asistente-title"
      className={`${SECTION} lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`}
    >
      <SectionHeading
        id="asistente-title"
        kicker={assistant.kicker}
        title={assistant.title}
        intro={assistant.intro}
      />
      <AssistantChat
        locale={locale}
        copy={assistant}
        available
        contactLink={
          <Link href={paths.contact} className={TEXT_LINK}>
            {assistant.contact.label}
            <Arrow />
          </Link>
        }
      />
    </section>
  );
}
