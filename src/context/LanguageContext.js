import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import i18n, { loadLanguage, setLanguage as saveLanguage, LANGUAGES } from '../i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(i18n.locale);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage().then((lang) => {
      setLocale(lang);
      setIsLoaded(true);
    });
  }, []);

  const changeLanguage = useCallback(async (langCode) => {
    await saveLanguage(langCode);
    i18n.locale = langCode;
    setLocale(langCode);
  }, []);

  const t = useCallback((key, options) => {
    return i18n.t(key, options);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, languages: LANGUAGES, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
