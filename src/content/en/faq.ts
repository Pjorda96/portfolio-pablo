import type { FaqContent } from '../types';
import { meta } from './meta';

/** Answers are plain text so they can feed `FAQPage` JSON-LD unchanged. */
export const faq: FaqContent = {
  meta: {
    title: 'FAQ · Pablo Jordá, freelance web developer',
    description:
      'Timelines, process, maintenance, communication, code ownership and remote work: clear answers before you start your web project.',
  },
  hero: {
    kicker: 'FAQ',
    title: 'Before we start',
    lead: 'The most common questions about how I work. If yours isn’t here, just ask me.',
  },
  items: [
    {
      id: 'plazos',
      question: 'How long does a project take?',
      answer:
        'It depends on the scope. A custom website is usually live within a few weeks; an MVP takes a little longer, but not months. After our first conversation you get a specific timeline in writing.',
    },
    {
      id: 'proceso',
      question: 'What does the process look like?',
      answer:
        'Four steps: we talk about your project, I send you a proposal with scope, timeline and milestones, I build it with frequent deliveries you can see and try, and we launch it with follow-up afterwards.',
    },
    {
      id: 'ia',
      question: 'What does AI-powered development mean?',
      answer:
        'It means I use AI as a tool at every stage: analysis, code, testing and documentation. It lets me deliver sooner. Decisions and the final review are always mine, to the same quality standard.',
    },
    {
      id: 'comunicacion',
      question: 'How do we communicate during the project?',
      answer:
        'Directly with me. We agree on a channel, usually email plus the occasional video call, and you get weekly progress on a preview URL where you can see the real work.',
    },
    {
      id: 'remoto',
      question: 'Do you work remotely?',
      answer:
        'Yes. I work from Valencia, Spain, with clients anywhere, in English or Spanish. If you’re nearby and prefer it, we can meet in person at key moments.',
    },
    {
      id: 'propiedad',
      question: 'Who owns the code?',
      answer:
        'You do. When we finish, the code, repository, domain and services are in your name, with documentation so any developer can pick it up.',
    },
    {
      id: 'mantenimiento',
      question: 'What happens after launch?',
      answer:
        'I stay with you over the following weeks to handle any adjustments. If you like, we can agree on ongoing maintenance: updates, security, improvements and new features.',
    },
    {
      id: 'proyecto-existente',
      question: 'Can you work on an existing project?',
      answer:
        'Yes. I start by reviewing the code and infrastructure, tell you what’s solid, what should be improved and what the risks are, and we decide how to move forward from there.',
    },
    {
      id: 'primer-paso',
      question: 'What’s the first step?',
      answer:
        'Fill in the contact form with a few lines about your project or problem. I’ll reply personally to set up a first conversation, no strings attached.',
    },
  ],
  cta: {
    title: 'Still have a question?',
    text: 'Ask me directly. You’ll hear back from me, not from an automated system.',
    cta: { label: 'Get in touch', href: meta.routes.contact },
  },
};
