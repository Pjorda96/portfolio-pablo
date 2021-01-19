const language = 'i18nextLng';

export function storeLocalLang(lang) {
  localStorage.setItem(language, lang);
}

export function getLocalLang() {
  return localStorage.getItem(language);
}
