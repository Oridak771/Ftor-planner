import { I18nManager } from 'react-native';
import { t } from '../locales/i18n';

// Define ingredients with translations
export const commonIngredients = [
  // These will be translated at runtime using the t() function
  'tomatoes',
  'onions',
  'garlic',
  'olive_oil',
  'salt',
  'pepper',
  'chicken',
  'beef',
  'rice',
  'pasta',
  'potatoes',
  'carrots',
  'lettuce',
  'cucumber',
  'lemon',
  'flour',
  'sugar',
  'eggs',
  'milk',
  'butter',
  'cheese',
  'yogurt',
  'bread',
  'parsley',
  'cilantro',
  'cumin',
  'paprika',
  'turmeric',
  'ginger',
  'cinnamon'
].map(ingredient => t(`ingredients.${ingredient}`));