import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en';
import hi from './hi';
import ta from './ta';
import te from './te';
import kn from './kn';
import ml from './ml';
import bn from './bn';

const i18n = new I18n({
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
});

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

const STORAGE_KEY = 'app_language';

export const setLanguage = async (langCode) => {
  i18n.locale = langCode;
  await AsyncStorage.setItem(STORAGE_KEY, langCode);
};

export const loadLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && i18n.translations[stored]) {
      i18n.locale = stored;
      return stored;
    }
  } catch {}

  const deviceLocale = getLocales()[0]?.languageCode || 'en';
  if (i18n.translations[deviceLocale]) {
    i18n.locale = deviceLocale;
    return deviceLocale;
  }

  i18n.locale = 'en';
  return 'en';
};

export const getCurrentLanguage = () => i18n.locale;

export default i18n;
