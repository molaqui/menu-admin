import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locale/en.json';
import fr from './locale/fr.json';
import ar from './locale/ar.json';
import zh from './locale/zh.json';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Détecteur de langue pour détecter la langue stockée dans le localStorage
i18n
  .use(Backend) // Optionnel si vous chargez des fichiers de traduction depuis le serveur
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    lng: localStorage.getItem('i18nextLng') || 'en', // Charger la langue depuis localStorage ou utiliser la langue par défaut 'en'
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
