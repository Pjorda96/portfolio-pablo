import type { SiteContent } from '../types';
import { about } from './about';
import { casePixelYPapel } from './case-pixel-y-papel';
import { contact } from './contact';
import { faq } from './faq';
import { home } from './home';
import { legal } from './legal';
import { meta } from './meta';
import { services } from './services';

export const content: SiteContent = {
  meta,
  home,
  services,
  casePixelYPapel,
  about,
  faq,
  legal,
  contact,
};
