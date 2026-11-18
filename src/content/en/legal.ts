import { owner } from '../owner';
import type { LegalContent } from '../types';

/*
 * REVIEW BY THE OWNER BEFORE LAUNCH. English version of the Spanish legal
 * texts, which prevail in case of discrepancy. Draft written from the planned
 * setup (Vercel hosting + Web Analytics/Speed Insights, Resend for the contact
 * form, optional Cloudflare Turnstile and the F4 AI assistant). It is not
 * legal advice: check it against the final implementation and fill `{{NIF}}`
 * and `{{DOMICILIO}}` in `src/content/owner.ts`.
 */

const holder = [
  `Owner: ${owner.name}`,
  `Tax ID (NIF): ${owner.nif}`,
  `Address: ${owner.address}`,
  `Email: ${owner.email}`,
  `Website: ${owner.domain}`,
];

export const legal: LegalContent = {
  draftNotice:
    'Under review: some of the owner’s identification details are still to be completed.',

  /* ----------------------------------------------------------- legal notice */
  notice: {
    meta: {
      title: 'Legal notice · Pablo Jordá',
      description:
        'Legal notice for pablojorda.es: owner details, terms of use, intellectual property and applicable law.',
    },
    title: 'Legal notice',
    updated: 'Last updated: November 2026',
    sections: [
      {
        title: 'Website owner',
        paragraphs: [
          'In accordance with article 10 of Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE), these are the details of the owner of this website:',
        ],
        items: holder,
      },
      {
        title: 'Purpose',
        paragraphs: [
          'This website presents the professional web development, AI solutions and digital product development services offered by its owner, and lets you get in touch through a form.',
        ],
        items: [],
      },
      {
        title: 'Terms of use',
        paragraphs: [
          'Access to this website is free. By browsing it you agree to use it lawfully, without harming its operation or the rights of others, and without sending unlawful or offensive content or unsolicited advertising through the form.',
        ],
        items: [],
      },
      {
        title: 'Intellectual and industrial property',
        paragraphs: [
          'The texts, illustrations, logo and design of this website belong to its owner. They may not be reproduced for commercial purposes without prior permission.',
          'The website’s source code is public and released under the MIT licence, on the terms stated in its repository. Third-party brands and names shown on the site, including Píxel y Papel, belong to their respective owners.',
        ],
        items: [],
      },
      {
        title: 'Liability',
        paragraphs: [
          'The owner works to keep the information on this site accurate and up to date, but does not guarantee that it is free of errors or that the service will be available without interruption.',
          'Links to third-party websites are provided for reference only. The owner neither controls nor is responsible for their content.',
        ],
        items: [],
      },
      {
        title: 'Applicable law and jurisdiction',
        paragraphs: [
          'This legal notice is governed by Spanish law. Any dispute will be submitted to the courts of Valencia, unless applicable law provides for a different venue, such as the consumer’s place of residence.',
        ],
        items: [],
      },
    ],
  },

  /* ---------------------------------------------------------------- privacy */
  privacy: {
    meta: {
      title: 'Privacy policy · Pablo Jordá',
      description:
        'How pablojorda.es handles your personal data: controller, purposes, legal basis, providers, retention and how to exercise your rights.',
    },
    title: 'Privacy policy',
    updated: 'Last updated: November 2026',
    sections: [
      {
        title: 'Data controller',
        paragraphs: [
          'Under Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD), the controller of your data is:',
        ],
        items: holder,
      },
      {
        title: 'What data I process',
        paragraphs: ['I only process the data needed to help you:'],
        items: [
          'Contact form data: name, email, company or project (optional), type of service and the message you write.',
          'Technical connection data, such as your IP address, used temporarily for site security and to prevent abusive submissions.',
          'Aggregated, anonymous visit statistics, collected without cookies.',
        ],
      },
      {
        title: 'Purposes and legal basis',
        paragraphs: [],
        items: [
          'Replying to your enquiries and, if you ask, preparing a proposal: your consent (art. 6.1.a GDPR) and steps taken at your request prior to entering a contract (art. 6.1.b GDPR).',
          'Protecting the site and the form against abuse and spam: the owner’s legitimate interest (art. 6.1.f GDPR).',
          'Understanding, in aggregate, how the site is used in order to improve it: the owner’s legitimate interest (art. 6.1.f GDPR), without identifying visitors.',
        ],
      },
      {
        title: 'Retention',
        paragraphs: [
          'I keep contact form messages while handling your enquiry and for at most one year after our last contact, unless we start working together: in that case, they are kept for the periods required by law. Technical security data is deleted shortly after.',
        ],
        items: [],
      },
      {
        title: 'Recipients and providers',
        paragraphs: [
          'I don’t share your data with third parties unless required by law. To run the service I rely on these providers, who act as data processors:',
        ],
        items: [
          'Vercel Inc. (United States): website hosting and anonymous usage and performance statistics.',
          'Resend (United States): email delivery of contact form messages.',
          'Cloudflare, Inc. (United States): anti-spam verification on the form, when enabled.',
          'Anthropic (United States): only if you use the site’s AI assistant, to generate its replies from what you write.',
        ],
      },
      {
        title: 'International transfers',
        paragraphs: [
          'Some of these providers may process data outside the European Economic Area. Such transfers rely on the EU-US Data Privacy Framework or on standard contractual clauses approved by the European Commission.',
        ],
        items: [],
      },
      {
        title: 'Your rights',
        paragraphs: [
          `You can exercise your rights of access, rectification, erasure, objection, restriction of processing and portability, and withdraw your consent at any time, by writing to ${owner.email}.`,
          'If you believe your data is not being processed lawfully, you can lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).',
        ],
        items: [],
      },
      {
        title: 'Security and minors',
        paragraphs: [
          'I apply appropriate technical and organisational measures to protect your data, such as encrypted connections (HTTPS) and restricted access.',
          'This website is not aimed at children under 14. If you are under that age, please don’t send any data through the form.',
        ],
        items: [],
      },
      {
        title: 'Changes to this policy',
        paragraphs: [
          'I may update this policy to reflect legal changes or changes to the site. The date of the latest update is shown at the top.',
        ],
        items: [],
      },
    ],
  },

  /* ---------------------------------------------------------------- cookies */
  cookies: {
    meta: {
      title: 'Cookie policy · Pablo Jordá',
      description:
        'pablojorda.es uses no advertising or tracking cookies. What technical storage the site uses and how you can manage it.',
    },
    title: 'Cookie policy',
    updated: 'Last updated: November 2026',
    sections: [
      {
        title: 'What cookies are',
        paragraphs: [
          'Cookies and similar technologies, such as the browser’s local storage, are small files or pieces of data a website saves on your device to remember information between visits.',
        ],
        items: [],
      },
      {
        title: 'What this site uses',
        paragraphs: [
          'This site uses no advertising, tracking or social media cookies. It only uses strictly technical storage, or preferences you choose yourself:',
        ],
        items: [
          'A technical cookie to remember the language you chose.',
          'Local storage (localStorage) to remember display preferences, such as the theme or the time of day in the city.',
        ],
      },
      {
        title: 'Cookieless statistics',
        paragraphs: [
          'To know, in aggregate, which pages are visited and how fast they load, I use Vercel Web Analytics and Speed Insights. They work without cookies and without identifying visitors or tracking them across sites.',
        ],
        items: [],
      },
      {
        title: 'Why there is no cookie banner',
        paragraphs: [
          'Under article 22.2 of the Spanish LSSI-CE, storage that is strictly necessary or expressly requested by you does not require consent. If a cookie that does require it is ever added, you will be asked for permission before it is set.',
        ],
        items: [],
      },
      {
        title: 'How to manage them',
        paragraphs: [
          'You can view, block or delete cookies and local storage from your browser settings. If you do, the site will keep working but won’t remember your preferences.',
        ],
        items: [],
      },
    ],
    table: {
      caption: 'Cookies and storage used by pablojorda.es',
      headers: {
        name: 'Name',
        provider: 'Owner',
        purpose: 'Purpose',
        duration: 'Duration',
        kind: 'Type',
      },
      rows: [
        {
          name: 'NEXT_LOCALE',
          provider: 'pablojorda.es',
          purpose: 'Remember the language you chose',
          duration: 'Session',
          kind: 'Technical cookie',
        },
        {
          name: 'Display preferences',
          provider: 'pablojorda.es',
          purpose: 'Remember the theme or city time you choose',
          duration: 'Until you delete it',
          kind: 'Local storage (preferences)',
        },
        {
          name: 'Vercel Web Analytics and Speed Insights',
          provider: 'Vercel Inc.',
          purpose: 'Aggregated visit and performance statistics',
          duration: 'Stores nothing on your device',
          kind: 'Cookieless analytics',
        },
      ],
    },
  },
};
