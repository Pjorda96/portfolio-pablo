import type { MetaContent } from '../types';

export const meta = {
  locale: 'en',
  htmlLang: 'en',
  ogLocale: 'en_GB',
  siteName: 'Pablo Jordá',
  jobTitle: 'AI-powered full-stack developer',
  routes: {
    home: '/en',
    services: {
      web: '/en/services/custom-web-development',
      ai: '/en/services/ai-solutions',
      apps: '/en/services/saas-mvp-development',
    },
    casePixelYPapel: '/en/projects/pixel-y-papel',
    about: '/en/about',
    // Not in the PLAN.md sitemap yet: the full FAQ, fed to FAQPage JSON-LD.
    faq: '/en/faq',
    contact: '/en/contact',
    legal: {
      notice: '/en/legal/legal-notice',
      privacy: '/en/legal/privacy',
      cookies: '/en/legal/cookies',
    },
  },
  nav: {
    label: 'Main navigation',
    services: 'Services',
    projects: 'Projects',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    cta: 'Tell me about your project',
    home: 'Pablo Jordá, home',
  },
  menu: { open: 'Open menu', close: 'Close menu', title: 'Menu' },
  languageSwitch: { label: 'Change language', target: 'Español' },
  theme: { label: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' },
  skipLink: 'Skip to content',
  footer: {
    tagline: 'Handmade in Valencia, Spain.',
    legalLabel: 'Legal information',
    notice: 'Legal notice',
    privacy: 'Privacy',
    cookies: 'Cookies',
  },
  notFound: {
    title: 'Page not found · Pablo Jordá',
    description:
      'This street does not exist in the city. Head back home to see services and projects.',
    text: 'This street does not exist in the city. The link may be wrong, or the page may have moved.',
    back: 'Back to home',
  },
  error: {
    title: 'Something went wrong',
    text: 'This page could not be loaded. It may be a temporary glitch: try again in a moment.',
    retry: 'Try again',
    back: 'Back to home',
  },
} as const satisfies MetaContent;
