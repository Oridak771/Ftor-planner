import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { setLanguage as setI18nLanguage, getCurrentLang, onLanguageChange, loadTranslations } from '../locales/i18n';
import theme from './theme'; // Assuming theme.js is in the same directory or path is adjusted

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLang());
  const [isRTL, setIsRTL] = useState(getCurrentLang() === 'ar');
  const [isContextLoading, setIsContextLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      setIsContextLoading(true);
      await loadTranslations();
      const initialLang = getCurrentLang();
      setCurrentLanguage(initialLang);
      setIsRTL(initialLang === 'ar');
      setIsContextLoading(false);
    };

    initializeApp();

    const cleanup = onLanguageChange((lang, reloadRequired) => {
      setCurrentLanguage(lang);
      setIsRTL(lang === 'ar');
    });
    return cleanup;
  }, []);

  const setLanguageContext = useCallback(async (lang) => {
    const result = await setI18nLanguage(lang);
    return result;
  }, []);

  if (isContextLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage: setLanguageContext, isRTL, isContextLoading }}>
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