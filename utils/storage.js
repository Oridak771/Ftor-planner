import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  MEALS: 'meals',
  RECIPES: 'recipes',
  SETTINGS: 'settings',
};

// Meals Storage
export const saveMeal = async (meal) => {
  try {
    const meals = await getMeals();
    const newMeal = {
      ...meal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    meals.push(newMeal);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return newMeal;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
};

export const updateMeal = async (id, updatedMeal) => {
  try {
    const meals = await getMeals();
    const index = meals.findIndex(meal => meal.id === id);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...updatedMeal };
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      return meals[index];
    }
    throw new Error('Meal not found');
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const deleteMeal = async (id) => {
  try {
    const meals = await getMeals();
    const filteredMeals = meals.filter(meal => meal.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(filteredMeals));
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

export const getMeals = async () => {
  try {
    const mealsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    return mealsJson ? JSON.parse(mealsJson) : [];
  } catch (error) {
    console.error('Error getting meals:', error);
    return [];
  }
};

// Recipes Storage
export const saveRecipe = async (recipe) => {
  try {
    const recipes = await getRecipes();
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    return newRecipe;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id, updatedRecipe) => {
  try {
    const recipes = await getRecipes();
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updatedRecipe };
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      return recipes[index];
    }
    throw new Error('Recipe not found');
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    const recipes = await getRecipes();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filteredRecipes));
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const getRecipes = async () => {
  try {
    const recipesJson = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
    return recipesJson ? JSON.parse(recipesJson) : [];
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};