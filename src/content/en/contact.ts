import { owner } from '../owner';
import type { ContactFormUi } from '../es/contact';
import type { ContactContent } from '../types';
import { meta } from './meta';

const CONTACT_EMAIL = owner.email;

export const contact: ContactContent = {
  meta: {
    title: 'Contact · Tell me about your project · Pablo Jordá',
    description:
      'Tell me about your web project, your product idea or the problem you want solved. I’ll reply personally with the next steps.',
  },
  hero: {
    kicker: 'Contact',
    title: 'Tell me about your project.',
    lead: 'A few lines are enough: what you need, where you are and what you’d like to achieve. You’ll hear back from me personally, not from an automated system.',
  },
  nextSteps: {
    title: 'What happens next',
    items: [
      'I read your message and reply personally.',
      'If it’s a fit, we set up a first conversation, no strings attached.',
      'I send you a written proposal with scope, timeline and milestones.',
    ],
  },
  form: {
    title: 'Contact form',
    requiredHint: 'Fields marked with * are required.',
    optional: '(optional)',
    fields: {
      name: {
        label: 'Name',
        placeholder: 'Your name',
        help: '',
      },
      email: {
        label: 'Email',
        placeholder: 'you@company.com',
        help: 'I only use it to reply to you.',
      },
      company: {
        label: 'Company or project',
        placeholder: 'Your company or project name',
        help: '',
      },
      service: {
        label: 'What do you need?',
        placeholder: 'Choose an option',
        help: 'Not sure yet? Pick “Something else” and we’ll work it out together.',
        options: {
          web: 'Custom web development',
          ai: 'AI solutions',
          apps: 'Apps, SaaS & MVPs',
          other: 'Something else',
        },
      },
      message: {
        label: 'Your project',
        placeholder: 'What you need, where you are and what you’d like to achieve.',
        help: 'Between 20 and 5000 characters. It doesn’t need to be technical.',
      },
      privacy: {
        label: 'I have read and accept the privacy policy.',
        linkLabel: 'Read the privacy policy',
      },
    },
    submit: 'Send message',
    sending: 'Sending…',
    success: {
      title: 'Message sent. Thank you!',
      text: 'I’ve received it and will reply personally as soon as I’ve read it.',
    },
    errors: {
      nameRequired: 'Please enter your name.',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Check your email: something seems to be missing, like the @ or the domain.',
      serviceRequired: 'Choose what you need, even if it’s “Something else”.',
      messageTooShort: 'Tell me a bit more: at least 20 characters.',
      messageTooLong: 'The message is too long: 5000 characters at most.',
      privacyRequired: 'Please accept the privacy policy so I can reply to you.',
      rateLimited: 'You’ve sent several messages in a row. Wait a few minutes and try again.',
      spam: 'I couldn’t verify the submission. Reload the page and try again.',
      generic: `The message couldn’t be sent. Try again in a few minutes or email me at ${CONTACT_EMAIL}.`,
    },
  },
  privacyNotice: {
    title: 'Basic data protection information',
    items: [
      { label: 'Controller', text: 'Pablo Jordá.' },
      {
        label: 'Purpose',
        text: 'Replying to your message and, if you ask, sending you a proposal.',
      },
      { label: 'Legal basis', text: 'Your consent and steps taken prior to entering a contract.' },
      {
        label: 'Recipients',
        text: 'Resend (email delivery) and Vercel (hosting), which may process data outside the EU under GDPR safeguards.',
      },
      {
        label: 'Your rights',
        text: `Access, rectification, erasure, objection, restriction and portability, by writing to ${CONTACT_EMAIL}.`,
      },
    ],
    link: { label: 'Full privacy policy', href: meta.routes.legal.privacy },
  },
};

/** Interface copy of the contact form not covered by `ContactContent` yet. */
export const contactFormUi: ContactFormUi = {
  errorSummary: 'Please check the form:',
  unavailable: `The form is temporarily unavailable. Email me at ${CONTACT_EMAIL} and I’ll reply all the same.`,
  honeypot: 'Leave this field empty',
};
