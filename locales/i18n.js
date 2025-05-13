import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const listeners = new Set();

const LANGS = ['fr', 'en', 'ar'];
const DEFAULT_LANG = 'fr';
const translations = { en, fr, ar };
let currentLang = DEFAULT_LANG;

export const loadTranslations = async () => {
  try {
    const stored = await AsyncStorage.getItem('language');
    if (stored && LANGS.includes(stored)) {
      await setLanguage(stored, true); // true = no reload
    } else {
      await setLanguage(DEFAULT_LANG, true);
    }
  } catch (error) {
    console.error('Error loading translations:', error);
  }
};

export const setLanguage = async (lang, skipRTLCheck = false) => {
  if (!LANGS.includes(lang)) return false;
  currentLang = lang;
  await AsyncStorage.setItem('language', lang);
  const shouldBeRTL = lang === 'ar';
  // Only change RTL if needed
  if (!skipRTLCheck && I18nManager.isRTL !== shouldBeRTL) {
    await I18nManager.forceRTL(shouldBeRTL);
    await I18nManager.allowRTL(shouldBeRTL);
    // Return special value to indicate reload is needed
    listeners.forEach(cb => cb(lang, true));
    return 'reload';
  }
  await I18nManager.forceRTL(shouldBeRTL);
  await I18nManager.allowRTL(shouldBeRTL);
  listeners.forEach(cb => cb(lang, false));
  return true;
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
