import type { HomeContent } from '../types';
import { meta } from './meta';
import { serviceById } from './services';

const { routes } = meta;
const web = serviceById('web');
const ai = serviceById('ai');
const apps = serviceById('apps');

export const home: HomeContent = {
  meta: {
    title: 'Pablo Jordá · Freelance web developer in Spain',
    description:
      'AI-powered full-stack developer in Valencia, Spain: custom web development, AI solutions and MVPs built with Next.js. Tell me about your project.',
  },
  hero: {
    kicker: 'Web development · AI · Product',
    title: 'A city of well-built things.',
    lead: 'I’m Pablo Jordá, an AI-powered full-stack developer based in Valencia, Spain. Every building in this city is something we can build together.',
    hint: 'Tap a building or pick a place below · drag the time',
    cta: { label: 'Tell me about your project', href: routes.contact },
  },
  city: {
    title: 'Places in the city',
    intro:
      'Six places in Valencia, six ways to work together: web development, artificial intelligence and digital products.',
    places: {
      taller: {
        landmark: 'La Lonja',
        short: 'Custom web',
        title: web.name,
        text: web.summary.text,
        points: web.summary.points,
      },
      lab: {
        landmark: 'City of Arts and Sciences',
        short: ai.name,
        title: ai.name,
        text: ai.summary.text,
        points: ai.summary.points,
      },
      puerto: {
        landmark: 'La Marina',
        short: apps.name,
        title: apps.name,
        // The harbour keeps its own line: products set sail from here.
        text: 'Products set sail from here: from idea to a first version in production, with foundations ready to grow.',
        points: apps.summary.points,
      },
      mercado: {
        landmark: 'Central Market',
        short: 'Projects',
        title: 'Projects',
        text: 'Real products with real customers. Píxel y Papel, a project shared by four partners: wedding websites with RSVP, live since 2024.',
        points: [
          'Píxel y Papel · co-founder and technical lead',
          'Case study: context, challenge and solution',
        ],
      },
      torre: {
        landmark: 'El Micalet',
        short: 'About',
        title: 'About me',
        text: 'AI-powered full-stack developer with 7+ years building web applications for insurance, fintech and architecture. Today I use AI at every stage of the work to deliver sooner without lowering the bar.',
        points: [
          'AI-powered development: faster, just as rigorous',
          'React, Next.js, TypeScript and Node.js',
          'Measurable quality: tests, accessibility and performance',
          'Remote, in English and Spanish',
        ],
      },
      faro: {
        landmark: 'The Lighthouse',
        short: 'Contact',
        title: 'Contact',
        text: 'Got a project in mind? Tell me about it and I’ll come back with a concrete proposal.',
        points: ['A short form, no strings attached', 'A personal reply, not an auto-responder'],
      },
    },
    anchors: {
      taller: 'web-development',
      lab: 'ai-solutions',
      puerto: 'apps-saas-mvp',
      mercado: 'projects',
      torre: 'about',
      faro: 'contact',
    },
    ui: {
      skipLink: 'Skip to the places',
      coordinates: '39.4699° N · 0.3763° W · Valencia',
      stageLabel: 'The city',
      dockLabel: 'Places in the city',
      clock: {
        label: 'City time',
        slider: 'Time of day in the city',
        real: 'Real time',
        play: 'Watch a whole day',
        modes: { real: 'your time', play: 'a day in 24 s', manual: 'chosen time' },
        placeholder: '--:--',
      },
      sheet: {
        cta: 'Tell me about your project',
        contactCta: 'Write to me',
        back: 'Back to the city',
        announce: '{landmark}: {title}',
      },
      scrollCue: 'See everything I do',
      noWebgl: 'Your browser cannot show the 3D scene. Use the places below to explore the city.',
    },
  },
  value: {
    title: 'What I build, built well',
    text: 'Custom web development, AI solutions and digital products for companies and founders. I work with AI at every step to get there sooner, and I review every delivery as if I were the one maintaining it for years.',
    points: [
      {
        title: 'Faster',
        text: 'AI speeds up analysis, code and testing. You see results sooner.',
      },
      {
        title: 'Just as rigorous',
        text: 'Tests, accessibility, performance and security. Human judgement in every decision.',
      },
      {
        title: 'Straight to me',
        text: 'You talk to the person who builds it. No middlemen, no email chains.',
      },
    ],
  },
  services: {
    title: 'Services',
    intro: 'Three ways to work together, depending on where your project stands.',
    linkLabel: 'See the service',
  },
  featuredCase: {
    kicker: 'Featured case',
    title: 'Píxel y Papel',
    text: 'Wedding websites with RSVP, live since 2024. A project shared by four partners, where I lead everything technical.',
    role: 'Co-founder and technical lead',
    link: { label: 'Read the case study', href: routes.casePixelYPapel },
  },
  process: {
    title: 'How we work',
    intro: 'A short, clear process, the same for a website as for a full product.',
    steps: [
      {
        title: 'We talk',
        text: 'You tell me about your project or your problem. I ask, I listen and I tell you honestly whether I’m the right fit.',
      },
      {
        title: 'Proposal',
        text: 'Scope, timeline and milestones in writing. You know what you’ll get before we start.',
      },
      {
        title: 'Build',
        text: 'Frequent deliveries you can see and try. AI helps me move fast; the review is mine.',
      },
      {
        title: 'Launch and follow-up',
        text: 'I put it live, check that everything holds up and stay close over the following weeks.',
      },
    ],
  },
  capabilities: {
    title: 'Capabilities',
    intro: 'Production-proven tools, chosen for what they bring to your project.',
    groups: [
      {
        title: 'Frontend',
        items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Animation and WebGL'],
      },
      {
        title: 'Backend and data',
        items: [
          'Node.js',
          'REST APIs',
          'PostgreSQL',
          'Authentication and payments',
          'Integrations',
        ],
      },
      {
        title: 'Applied AI',
        items: [
          'AI-assisted development',
          'Language model integration',
          'Document and data processing',
        ],
      },
      {
        title: 'Quality',
        items: [
          'Automated tests',
          'Accessibility (WCAG)',
          'Core Web Vitals',
          'Technical SEO',
          'Security',
        ],
      },
    ],
  },
  faqTeaser: {
    title: 'Frequently asked questions',
    intro: 'What people usually ask before we start.',
    ids: ['plazos', 'ia', 'propiedad', 'mantenimiento'],
    link: { label: 'See all questions', href: routes.faq },
  },
  finalCta: {
    title: 'Shall we build something together?',
    text: 'Tell me what you have in mind. I’ll reply personally with a concrete proposal.',
    cta: { label: 'Tell me about your project', href: routes.contact },
  },
};
