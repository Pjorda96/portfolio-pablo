import type { CaseStudyContent } from '../types';
import { meta } from './meta';

/*
 * Case study approved by the Píxel y Papel partners as written: qualitative,
 * Pablo as co-founder and technical lead of a four-partner project, never as
 * sole owner. No figures and no screenshots yet: add them only if the
 * partners provide them (see docs/CONTENIDO.md).
 */
export const casePixelYPapel: CaseStudyContent = {
  meta: {
    title: 'Píxel y Papel: case study · Pablo Jordá',
    description:
      'Wedding websites with RSVP, live since 2024. How I built the platform as co-founder and technical lead of a four-partner project.',
  },
  hero: {
    kicker: 'Case study',
    title: 'Píxel y Papel',
    lead: 'Digital invitations and wedding websites with RSVP. A project shared by four partners, live since 2024, where I’m co-founder and technical lead.',
  },
  summary:
    'Wedding websites with RSVP, live since 2024. A project shared by four partners, where I lead everything technical.',
  facts: [
    { label: 'Project', value: 'Digital invitations and event websites' },
    { label: 'My role', value: 'Co-founder and technical lead' },
    { label: 'Team', value: 'Four partners' },
    { label: 'Status', value: 'Live since 2024' },
  ],
  context: {
    title: 'Context',
    paragraphs: [
      'Píxel y Papel was started by four partners with a shared idea: every couple deserves a beautiful wedding website, with its own digital invitation and an easy way to know who’s coming.',
      'The project brings together design, care for the couples and technology. My part, as a co-founder, is the technology: deciding how it’s built, building it and keeping it running.',
    ],
  },
  challenge: {
    title: 'The challenge',
    paragraphs: [
      'Every wedding is different, but the product had to be one. Each couple needed their own personalised website without every order turning into a new development project.',
    ],
    items: [
      'A unique website for each event, with its own design and copy, on a single platform.',
      'An RSVP that guests of every age can complete easily on their phone.',
      'A dashboard to manage guests and replies without depending on anyone.',
      'Several languages, good performance and a reliable foundation for a day that only happens once.',
    ],
  },
  solution: {
    title: 'The solution',
    paragraphs: [
      'I designed and built two pieces that work together: the marketing site that presents the service, and the platform that brings each event to life.',
    ],
    items: [
      {
        title: 'One website per event',
        text: 'Each event gets its own address and website, generated from the same platform and personalised with its own design and content.',
      },
      {
        title: 'RSVP',
        text: 'Guests reply in a few steps from any device, without creating an account.',
      },
      {
        title: 'Management dashboard',
        text: 'Guest list, replies and event details in one place.',
      },
      {
        title: 'Solid technical foundation',
        text: 'Next.js and TypeScript, multiple languages, a managed database and automated deployment, with care for performance and accessibility.',
      },
    ],
  },
  role: {
    title: 'My role',
    paragraphs: [
      'I’m one of the four founding partners and the project’s technical lead. I own the architecture, the development of both the marketing site and the platform, the infrastructure and the maintenance.',
      'The product belongs to all four of us: business decisions, design and the relationship with couples are teamwork. My contribution is making sure the technology lives up to that work.',
    ],
  },
  result: {
    title: 'The result',
    paragraphs: [
      'Píxel y Papel has been live since 2024, helping real couples on one of the most important days of their lives.',
      'The platform lets us launch each new event website without starting from scratch, and the technical foundation lets us keep adding features and event types with confidence.',
    ],
  },
  stack: {
    title: 'Technology',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'next-intl', 'PostgreSQL', 'Vercel'],
  },
  link: { label: 'Visit Píxel y Papel', href: 'https://www.pixelypapel.com/' },
  cta: {
    title: 'Have a product in mind?',
    text: 'I can help you take it to production on the same technical foundation. Tell me your idea.',
    cta: { label: 'Tell me about your project', href: meta.routes.contact },
  },
};
