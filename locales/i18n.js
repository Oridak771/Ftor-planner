import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates'; // Import Expo Updates

const listeners = new Set();

const LANGS = ['fr', 'en', 'ar'];
const DEFAULT_LANG = 'fr';
const translations = { en, fr, ar };
let currentLang = DEFAULT_LANG;

export const loadTranslations = async () => {
  try {
    const stored = await AsyncStorage.getItem('language');
    // Set initial language without forcing RTL change yet, as app loads with persisted state
    if (stored && LANGS.includes(stored)) {
      currentLang = stored;
    } else {
      currentLang = DEFAULT_LANG;
    }
    // Apply RTL setting based on loaded language *without* triggering reload here
    const shouldBeRTL = currentLang === 'ar';
    await I18nManager.forceRTL(shouldBeRTL);
    await I18nManager.allowRTL(shouldBeRTL);

  } catch (error) {
    console.error('Error loading translations:', error);
    currentLang = DEFAULT_LANG; // Fallback
  }
};

export const setLanguage = async (lang, skipRTLCheck = false) => {
  if (!LANGS.includes(lang)) return false;

  const previousLang = currentLang;
  currentLang = lang;
  await AsyncStorage.setItem('language', lang);

  const shouldBeRTL = lang === 'ar';

  // Notify listeners immediately for non-RTL related updates
  listeners.forEach(cb => cb(lang, false));

  // Check if RTL direction needs to change
  if (!skipRTLCheck && I18nManager.isRTL !== shouldBeRTL) {
    try {
      // Apply RTL settings
      await I18nManager.forceRTL(shouldBeRTL);
      await I18nManager.allowRTL(shouldBeRTL);
      // Trigger app reload for RTL change
      await Updates.reloadAsync();
      // Note: Code execution stops here after reloadAsync
      return 'reloading'; // Indicate reload was triggered (though app restarts)
    } catch (e) {
      console.error("Failed to reload app after RTL change:", e);
      // Revert language change if reload fails?
      currentLang = previousLang;
      await AsyncStorage.setItem('language', previousLang);
      listeners.forEach(cb => cb(previousLang, false)); // Notify revert
      return false; // Indicate failure
    }
  } else {
    // If RTL didn't change, ensure the setting is still applied (e.g., on initial load)
    // This might be redundant if loadTranslations already handled it, but safe to keep.
    await I18nManager.forceRTL(shouldBeRTL);
    await I18nManager.allowRTL(shouldBeRTL);
  }

  return true; // Indicate success without reload
};

export const onLanguageChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const t = (key, params = {}) => {
  let text = (translations[currentLang] && translations[currentLang][key]) || key;
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
  }
  return text;
};

export const getCurrentLang = () => currentLang;
export const getLangs = () => LANGS;
