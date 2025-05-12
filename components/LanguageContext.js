import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { setLanguage as setI18nLanguage, getCurrentLang, onLanguageChange, loadTranslations } from '../locales/i18n';
// theme import is not used in the loading view anymore, but keep if used elsewhere or for future
// import theme from './theme'; 

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLang());
  const [isRTL, setIsRTL] = useState(getCurrentLang() === 'ar');
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [providerKey, setProviderKey] = useState(0); // Key for re-rendering Provider

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
      if (reloadRequired) {
        // Increment key to force re-render of Provider and its children
        setProviderKey(prevKey => prevKey + 1);
      }
    });
    return cleanup;
  }, []); // This effect runs once on mount

  const setLanguageContext = useCallback(async (lang) => {
    // setI18nLanguage will trigger onLanguageChange, which updates state and providerKey
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
    <LanguageContext.Provider 
      key={providerKey} // Add key here
      value={{ currentLanguage, setLanguage: setLanguageContext, isRTL, isContextLoading }}
    >
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