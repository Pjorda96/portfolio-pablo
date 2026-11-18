import type { AboutContent } from '../types';
import { meta } from './meta';

export const about: AboutContent = {
  meta: {
    title: 'About · Pablo Jordá, full-stack developer',
    description:
      'AI-powered full-stack developer based in Valencia, Spain, with 7+ years in insurance, fintech and architecture software. How I work and what I care about.',
  },
  hero: {
    kicker: 'About',
    title: 'Hi, I’m Pablo.',
    lead: 'AI-powered full-stack developer based in Valencia, Spain. I build websites, applications and digital products, using AI at every step to ship them sooner without lowering the bar.',
  },
  avatarAlt: 'Illustrated portrait of Pablo Jordá',
  intro: [
    'I’ve spent more than 7 years building web applications end to end: interfaces, APIs, databases and the infrastructure that keeps them running.',
    'Today I work with companies and founders who have a specific problem or an idea to take to production. You bring the knowledge of your business; I take care of everything technical.',
    'AI is my everyday working tool. It helps me analyse, code, test and document much faster. What doesn’t change is the judgement: every decision and every line I deliver goes through my own review.',
  ],
  experience: {
    title: 'Experience',
    text: 'I’ve worked in sectors where mistakes are expensive and quality isn’t optional:',
    sectors: [
      {
        title: 'Insurance',
        text: 'Applications with complex business rules, lots of data and users who rely on them every day.',
      },
      {
        title: 'Fintech and blockchain',
        text: 'Financial products where security, traceability and reliability are the starting point.',
      },
      {
        title: 'Architecture software',
        text: 'Technical tools for demanding professionals, with rich interfaces and plenty of detail.',
      },
    ],
  },
  specialties: {
    title: 'Specialties',
    items: [
      'Full-stack development with React, Next.js, TypeScript and Node.js',
      'AI-powered development, with human review on every delivery',
      'SaaS products and MVPs: accounts, payments and admin panels',
      'Web performance and technical SEO',
      'Accessibility and interface design',
    ],
  },
  quality: {
    title: 'How I work',
    intro:
      'Moving fast only matters if what ships holds up. That’s why some things aren’t up for negotiation:',
    items: [
      {
        title: 'Tests',
        text: 'Automated tests where it matters, so the code can change without fear.',
      },
      {
        title: 'Accessibility',
        text: 'Interfaces that work with a keyboard and a screen reader, with proper contrast.',
      },
      {
        title: 'Performance',
        text: 'Pages that load fast on any phone, measured with real-user data.',
      },
      {
        title: 'Security',
        text: 'Good practice by design: protected data, up-to-date dependencies and secure headers.',
      },
    ],
  },
  working: {
    title: 'Working together',
    items: [
      'Remote, from Valencia, with clients anywhere',
      'In English and Spanish',
      'Direct communication with me, no middlemen',
      'Visible progress every week',
    ],
  },
  cta: {
    title: 'Does the way I work suit you?',
    text: 'Tell me about your project and we’ll figure out how to approach it together.',
    cta: { label: 'Get in touch', href: meta.routes.contact },
  },
};
