import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

import { getLocalLang, getWindowLang } from './utils';

const resources = {
  en: { translation: en },
  es: { translation: es }
}

const localLang = getLocalLang();
const navLang = getWindowLang();
const lng = localLang || navLang || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng,
    fallbackLng: navLang || 'es',

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
