import type { ServiceId, ServicesContent } from '../types';
import { meta } from './meta';

const { routes } = meta;

const contactCta = { label: 'Tell me about your project', href: routes.contact };

export const services: ServicesContent = {
  title: 'Services',
  intro:
    'Three ways to work together. In all of them, AI is my tool to get there sooner; I review and sign off on the result myself.',
  items: [
    /* ------------------------------------------------ custom web development */
    {
      id: 'web',
      name: 'Custom web development',
      href: routes.services.web,
      meta: {
        title: 'Custom web development in Spain · Pablo Jordá',
        description:
          'Custom websites and web apps built with Next.js and React: fast, accessible and ready for Google. Freelance web developer in Spain, working remotely.',
      },
      summary: {
        text: 'Hand-built websites and web apps with Next.js and React: fast, accessible and ready to rank on Google from day one.',
        points: [
          'Company websites and landing pages that convert',
          'Web apps and internal dashboards',
          'Technical SEO and green Core Web Vitals',
        ],
      },
      hero: {
        kicker: 'Custom web development',
        title: 'A website built for your business, not bent out of a template.',
        lead: 'Technical design, development and launch of websites and web apps with Next.js, React and TypeScript. Fast, accessible and easy to maintain.',
      },
      problem: {
        title: 'When it makes sense',
        intro: 'A template works until it doesn’t. It usually shows in one of these ways:',
        items: [
          'Your site is slow and Google doesn’t show it where it should.',
          'Every small change depends on a plugin, or on someone who has moved on.',
          'You need something no template does: a client area, a configurator, an internal dashboard.',
          'The site doesn’t reflect how good your business really is.',
        ],
      },
      approach: {
        title: 'How I approach it',
        paragraphs: [
          'I start with what the site has to achieve: be found, be understood and get people to reach out. From there I design the simplest architecture that does the job.',
          'I work with Next.js, React and TypeScript on modern infrastructure. AI helps me move faster at every stage; every delivery goes through my own review, with tests and automated checks.',
        ],
        principles: [
          {
            title: 'Fast by default',
            text: 'Green Core Web Vitals as a requirement, not a future improvement.',
          },
          {
            title: 'Accessible to everyone',
            text: 'Keyboard-friendly, readable and screen-reader compatible.',
          },
          {
            title: 'Technical SEO from the start',
            text: 'Metadata, structured data, sitemap and clean URLs in every language.',
          },
          {
            title: 'Easy to maintain',
            text: 'Clear, typed, documented code that any developer can pick up.',
          },
        ],
      },
      deliverables: {
        title: 'What you get',
        items: [
          {
            title: 'A live website or web app',
            text: 'On your domain, with HTTPS, privacy-friendly analytics and backups.',
          },
          {
            title: 'The source code',
            text: 'In a repository you own, with full history and no proprietary lock-in.',
          },
          {
            title: 'A complete SEO foundation',
            text: 'Titles, descriptions, structured data, sitemap and multilingual setup if you need it.',
          },
          {
            title: 'Documentation and handover',
            text: 'How it’s built, how it’s deployed and how to edit the content.',
          },
        ],
      },
      process: {
        title: 'How we work',
        steps: [
          {
            title: 'First conversation',
            text: 'You tell me what you need and what you have today. I answer questions and flag risks.',
          },
          {
            title: 'Proposal',
            text: 'Scope, timeline and milestones in writing, no fine print.',
          },
          {
            title: 'Incremental delivery',
            text: 'You see real progress every week on a preview URL and give feedback as we go.',
          },
          {
            title: 'Launch',
            text: 'Go-live, a performance and SEO check, and support through the first weeks.',
          },
        ],
      },
      faq: {
        title: 'Questions about web development',
        items: [
          {
            question: 'Will I be able to edit the content myself?',
            answer:
              'Yes, if you need to. Depending on the project, I connect a simple CMS or keep the copy in easy-to-edit files. We settle it in the proposal.',
          },
          {
            question: 'Do you rebuild my current site or start from scratch?',
            answer:
              'It depends on what’s there. I review your current site and tell you what to keep, what to migrate and what to rebuild, protecting your URLs so you don’t lose rankings.',
          },
          {
            question: 'Why Next.js and not WordPress?',
            answer:
              'For custom websites, Next.js gives you better performance, stronger security and more design freedom. If another tool fits your case better, I’ll tell you.',
          },
        ],
      },
      cta: {
        title: 'Shall we talk about your website?',
        text: 'Tell me what you have and what’s missing. I’ll reply personally with the next steps.',
        cta: contactCta,
      },
    },

    /* ----------------------------------------------------------- ai solutions */
    {
      id: 'ai',
      name: 'AI solutions',
      href: routes.services.ai,
      meta: {
        title: 'AI solutions for your business · Pablo Jordá',
        description:
          'Bring me the problem and I’ll solve it, using AI at every step: custom solutions delivered sooner, with quality reviewed by a human.',
      },
      summary: {
        text: 'You bring the problem; I solve it, with AI at my side. I use it at every step, from analysis to delivery, to reach a solid solution sooner, built around your business.',
        points: [
          'From problem to solution in far less time',
          'AI works for me; you get the result',
          'The same quality bar, reviewed by a human',
        ],
      },
      hero: {
        kicker: 'AI solutions',
        title: 'You bring the problem. I solve it.',
        lead: 'I lean on AI at every step, from analysis to code, tests and documentation, to reach a solid solution sooner. AI is my tool; you get the result, reviewed by a human.',
      },
      problem: {
        title: 'What kind of problems',
        intro:
          'You don’t need to know which technology to use. You just need a problem like these:',
        items: [
          'A process that eats hours every week and should simply run on its own.',
          'Information scattered across spreadsheets, inboxes and tools that don’t talk to each other.',
          'A legacy system that needs to be understood, fixed or migrated.',
          'An idea that seemed too slow or too costly to build.',
        ],
      },
      approach: {
        title: 'How I approach it',
        paragraphs: [
          'First I understand the problem and what solving it well means for your business. Then I pick the simplest solution that works, whether that’s an integration, an application or a change to what you already have.',
          'AI lets me analyse faster, explore alternatives, write code and tests, and document without wasting time. I review every piece I deliver myself: I’m accountable for the result.',
          'If the best solution includes an AI model inside the product, I integrate it carefully: protected data, controlled costs and results you can verify. If it isn’t needed, I leave it out.',
        ],
        principles: [
          {
            title: 'The problem leads',
            text: 'Technology is chosen last, once we know what needs solving.',
          },
          {
            title: 'AI as a tool',
            text: 'It speeds up my work; decisions and review stay human.',
          },
          {
            title: 'No shortcuts on quality',
            text: 'Tests, code review, security and accessibility, as in any project.',
          },
          {
            title: 'No hype',
            text: 'I tell you what can be done, what can’t and the risks of each option.',
          },
        ],
      },
      deliverables: {
        title: 'What you get',
        items: [
          {
            title: 'A clear diagnosis',
            text: 'The problem in plain words, the possible options and the one I recommend.',
          },
          {
            title: 'A working solution',
            text: 'Live and connected to the tools you already use, not a demo.',
          },
          {
            title: 'Code and documentation',
            text: 'Yours, readable and tested, so nobody depends on a black box.',
          },
          {
            title: 'Ongoing support',
            text: 'Follow-up after delivery and adjustments when real use calls for them.',
          },
        ],
      },
      process: {
        title: 'How we work',
        steps: [
          {
            title: 'You describe the problem',
            text: 'In your own words, no jargon. I’ll ask whatever I need.',
          },
          {
            title: 'Diagnosis and proposal',
            text: 'What I’ll build, how we’ll know it works and when it will be ready.',
          },
          {
            title: 'Accelerated build',
            text: 'I move fast with AI at my side and show you results from the first weeks.',
          },
          {
            title: 'Delivery and follow-up',
            text: 'I put it live, documented, and check with you how it performs day to day.',
          },
        ],
      },
      faq: {
        title: 'Questions about AI solutions',
        items: [
          {
            question: 'Do I need to know anything about AI?',
            answer:
              'No. You know your business and its problem; the technical side, AI included, is my job.',
          },
          {
            question: 'If AI does part of the work, does quality suffer?',
            answer:
              'No. AI speeds up the mechanical part; the judgement and the review are mine. The code goes through the same tests, reviews and security checks as any other.',
          },
          {
            question: 'What happens to my data?',
            answer:
              'I only use the data that’s strictly needed, with providers whose terms prevent it from being used to train models. If sensitive information is involved, we agree in writing how it’s handled before we start.',
          },
        ],
      },
      cta: {
        title: 'What problem do you want off your plate?',
        text: 'Describe it in a few lines. I’ll reply with how I’d tackle it and what the next steps would be.',
        cta: { label: 'Tell me the problem', href: routes.contact },
      },
    },

    /* ------------------------------------------------------ apps, saas & mvps */
    {
      id: 'apps',
      name: 'Apps, SaaS & MVPs',
      href: routes.services.apps,
      meta: {
        title: 'MVP, SaaS and app development · Pablo Jordá',
        description:
          'From idea to a live MVP: accounts, payments, admin panel and a mobile app on the same API. Custom SaaS development by a developer based in Spain.',
      },
      summary: {
        text: 'From idea to a first version in production, with foundations ready to grow.',
        points: [
          'MVPs in weeks, not months',
          'Accounts, payments and admin panel',
          'Web and mobile app on the same API',
        ],
      },
      hero: {
        kicker: 'Apps, SaaS & MVPs',
        title: 'From idea to a product people already use.',
        lead: 'I build the first version of your product, get it into the hands of real users and leave it ready to grow without a rewrite.',
      },
      problem: {
        title: 'When it makes sense',
        intro: 'This service is a good fit if you recognise yourself here:',
        items: [
          'Your idea holds up in conversations and you need a product to test it for real.',
          'You’ve been quoted months of development before you can show anything.',
          'Your prototype works, but it wouldn’t survive real users or payments.',
          'You need web and mobile and don’t want to maintain two separate products.',
        ],
      },
      approach: {
        title: 'How I approach it',
        paragraphs: [
          'An MVP isn’t a small version of everything: it’s the complete version of what matters. Together we define what the product must do to prove it works, and leave the rest for later.',
          'I build on proven pieces such as authentication, payments and email, so the time goes into what makes your product unique. With AI at my side, first versions arrive sooner without compromising code quality.',
        ],
        principles: [
          {
            title: 'The essentials, done properly',
            text: 'A few features done well rather than many half-finished.',
          },
          {
            title: 'Live early',
            text: 'Real users as soon as possible: it’s the only way to know what to build next.',
          },
          {
            title: 'Built to grow',
            text: 'Architecture, tests and automated deployment from day one.',
          },
          {
            title: 'Measurable',
            text: 'Analytics and logs so decisions rest on data, not hunches.',
          },
        ],
      },
      deliverables: {
        title: 'What you get',
        items: [
          {
            title: 'A product in production',
            text: 'Web, mobile app or both, live and ready for your first users.',
          },
          {
            title: 'What every SaaS needs',
            text: 'Sign-up and login, roles, payments and subscriptions, emails and an admin panel.',
          },
          {
            title: 'Infrastructure in your name',
            text: 'Repository, hosting and services in your own accounts, with automated deployment.',
          },
          {
            title: 'A roadmap',
            text: 'What to build next, ranked by impact and by what your users tell you.',
          },
        ],
      },
      process: {
        title: 'How we work',
        steps: [
          {
            title: 'Define the core',
            text: 'What problem the product solves, for whom, and what the first version needs.',
          },
          {
            title: 'Proposal and plan',
            text: 'A fixed scope for the first version, timeline and milestones.',
          },
          {
            title: 'Iterative build',
            text: 'Frequent deliveries on a preview environment you can show to anyone.',
          },
          {
            title: 'Launch and learn',
            text: 'We go live, measure and decide the next iteration together.',
          },
        ],
      },
      faq: {
        title: 'Questions about apps, SaaS & MVPs',
        items: [
          {
            question: 'How long does an MVP take?',
            answer:
              'It depends on the scope, but the goal is a first version in production in weeks, not months. The proposal gives you a specific timeline.',
          },
          {
            question: 'Can you take over an existing product?',
            answer:
              'Yes. I start by reviewing the code and infrastructure and tell you what to keep, improve or rebuild before adding new features.',
          },
          {
            question: 'Do you build the mobile app too?',
            answer:
              'Yes. Whenever it fits, web and mobile share the same API and logic, so you maintain a single product.',
          },
        ],
      },
      cta: {
        title: 'Got a product idea?',
        text: 'Tell me about it, even if it’s still rough. I’ll help you pin down what the first version needs.',
        cta: { label: 'Tell me your idea', href: routes.contact },
      },
    },
  ],
};

export const serviceById = (id: ServiceId) => {
  const service = services.items.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
};
