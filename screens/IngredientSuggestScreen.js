import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, I18nManager, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../components/theme';
import Card from '../components/Card';
import { commonIngredients } from '../data/commonIngredients';
import { t } from '../locales/i18n';

const USER_INGREDIENTS_KEY = 'userIngredients';
const RECIPES_KEY = 'recipes';

const IngredientSuggestScreen = () => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);

  useEffect(() => {
    loadUserIngredients();
    loadAllRecipes();
  }, []);

  const loadUserIngredients = async () => {
    try {
      const savedIngredients = await AsyncStorage.getItem(USER_INGREDIENTS_KEY);
      if (savedIngredients) {
        setUserIngredients(JSON.parse(savedIngredients));
      }
    } catch (error) {
      console.error('Error loading user ingredients:', error);
      Alert.alert(t('error'), t('loadDataError'));
    }
  };

  const saveUserIngredients = async (ingredients) => {
    try {
      await AsyncStorage.setItem(USER_INGREDIENTS_KEY, JSON.stringify(ingredients));
    } catch (error) {
      console.error('Error saving user ingredients:', error);
      Alert.alert(t('error'), t('saveDataError'));
    }
  };

  const loadAllRecipes = async () => {
    try {
      const recipesData = await AsyncStorage.getItem(RECIPES_KEY);
      if (recipesData) {
        setAllRecipes(JSON.parse(recipesData));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert(t('error'), t('loadDataError'));
    }
  };

  const filteredIngredients = searchQuery
    ? commonIngredients.filter(ing =>
        t(`ingredientsList.${ing.toLowerCase()}`, { defaultValue: ing })
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : commonIngredients;

  const toggleIngredient = (ingredient) => {
    setUserIngredients(prev => {
      let updatedIngredients;
      if (prev.includes(ingredient)) {
        updatedIngredients = prev.filter(i => i !== ingredient);
      } else {
        updatedIngredients = [...prev, ingredient];
      }
      saveUserIngredients(updatedIngredients);
      return updatedIngredients;
    });
  };

  const findMatches = useCallback(() => {
    if (userIngredients.length === 0 || allRecipes.length === 0) {
      setMatchedRecipes([]);
      return;
    }

    const matches = allRecipes
      .map(recipe => {
        const recipeIngredientsLower = (recipe.ingredients || '').toLowerCase();
        const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());

        let matchCount = 0;
        let missingCount = 0;
        const requiredIngredients = recipeIngredientsLower.split('\n').map(s => s.trim()).filter(Boolean);

        const ownedIngredients = userIngredientsLower.filter(userIng =>
          recipeIngredientsLower.includes(userIng)
        );
        matchCount = ownedIngredients.length;

        const recipeIngredientSet = new Set(requiredIngredients.map(ing => ing.split(' ')[0]));
        missingCount = [...recipeIngredientSet].filter(recipeIngName =>
          !userIngredientsLower.some(userIng => userIng.includes(recipeIngName))
        ).length;

        if (matchCount > 0) {
          return {
            ...recipe,
            matchCount: matchCount,
            missingCount: missingCount,
          };
        }
        return null;
      })
      .filter(Boolean);

    matches.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return a.missingCount - b.missingCount;
    });

    setMatchedRecipes(matches);
  }, [userIngredients, allRecipes]);

  useEffect(() => {
    findMatches();
  }, [userIngredients, allRecipes, findMatches]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, I18nManager.isRTL && styles.rtlSearchInputContainer]}>
          <MaterialIcons name="search" size={20} color={theme.COLORS.gray[500]} />
          <TextInput
            style={[styles.searchInput, I18nManager.isRTL && styles.rtlSearchInput]}
            placeholder={t('searchIngredients')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.COLORS.gray[500]}
            textAlign={I18nManager.isRTL ? 'right' : 'left'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={theme.COLORS.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, I18nManager.isRTL && styles.rtlText]}>
            {t('yourIngredients')}
          </Text>
          <View style={[styles.selectedIngredientsContainer, I18nManager.isRTL && styles.rtlContainer]}>
            {userIngredients.length > 0 ? (
              userIngredients.map(ingredient => (
                <TouchableOpacity
                  key={ingredient}
                  style={[styles.selectedIngredient, I18nManager.isRTL && styles.rtlSelectedIngredient]}
                  onPress={() => toggleIngredient(ingredient)}
                >
                  <Text style={[styles.selectedIngredientText, I18nManager.isRTL && styles.rtlMargin]}>
                    {t(`ingredientsList.${ingredient.toLowerCase()}`, { defaultValue: ingredient })}
                  </Text>
                  <MaterialIcons name="close" size={16} color={theme.COLORS.white} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noSelectionText, I18nManager.isRTL && styles.rtlText]}>
                {t('noIngredientsAdded')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, I18nManager.isRTL && styles.rtlText]}>
            {searchQuery ? t('searchResults') : t('commonIngredients')}
          </Text>
          <View style={[styles.ingredientsGrid, I18nManager.isRTL && styles.rtlContainer]}>
            {filteredIngredients.map(ingredient => (
              <TouchableOpacity
                key={ingredient}
                style={[
                  styles.ingredientButton,
                  userIngredients.includes(ingredient) && styles.selectedIngredientButton,
                  I18nManager.isRTL && styles.rtlIngredientButton
                ]}
                onPress={() => toggleIngredient(ingredient)}
              >
                <Text
                  style={[
                    styles.ingredientButtonText,
                    userIngredients.includes(ingredient) && styles.selectedIngredientButtonText,
                    I18nManager.isRTL && styles.rtlText
                  ]}
                >
                  {t(`ingredientsList.${ingredient.toLowerCase()}`, { defaultValue: ingredient })}
                </Text>
              </TouchableOpacity>
            ))}
            {searchQuery && filteredIngredients.length === 0 && (
              <Text style={styles.noResultsText}>{t('noResultsFound')}</Text>
            )}
          </View>
        </View>

        {matchedRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, I18nManager.isRTL && styles.rtlText]}>
              {t('matchingRecipes')}
            </Text>
            {matchedRecipes.map(recipe => (
              <Card key={recipe.id} style={styles.recipeCard}>
                <Text style={[styles.recipeTitle, I18nManager.isRTL && styles.rtlText]}>
                  {recipe.title}
                </Text>
                {recipe.description && (
                  <Text style={[styles.recipeDescription, I18nManager.isRTL && styles.rtlText]} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                )}
                <View style={[styles.matchInfo, I18nManager.isRTL && styles.rtlMatchInfo]}>
                  <MaterialIcons name="check-circle" size={16} color={theme.COLORS.success} />
                  <Text style={[styles.matchText, I18nManager.isRTL && styles.rtlMatchText]}>
                    {t('matchesCount', { count: recipe.matchCount })}
                  </Text>
                  {recipe.missingCount > 0 && (
                    <>
                      <MaterialIcons name="remove-shopping-cart" size={16} color={theme.COLORS.warning} style={styles.missingIcon} />
                      <Text style={[styles.matchText, styles.missingText, I18nManager.isRTL && styles.rtlMatchText]}>
                        {t('missingCount', { count: recipe.missingCount })}
                      </Text>
                    </>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
        {userIngredients.length > 0 && matchedRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={theme.COLORS.gray[300]} />
            <Text style={styles.emptyStateText}>{t('noMatchingRecipesFound')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
    backgroundColor: theme.COLORS.white,
  },
  headerTitle: {
    fontSize: theme.FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  searchContainer: {
    padding: theme.SPACING.md,
    backgroundColor: theme.COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.gray[100],
    borderRadius: theme.BORDER_RADIUS.md,
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.sm,
  },
  content: {
    flex: 1,
    padding: theme.SPACING.md,
  },
  section: {
    marginBottom: theme.SPACING.lg,
  },
  sectionTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.md,
  },
  selectedIngredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.SPACING.md,
  },
  selectedIngredient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary,
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.full,
    marginRight: theme.SPACING.xs,
    marginBottom: theme.SPACING.xs,
  },
  selectedIngredientText: {
    color: theme.COLORS.white,
    marginRight: theme.SPACING.xs,
    fontSize: theme.FONT_SIZES.sm,
  },
  noSelectionText: {
    color: theme.COLORS.gray[500],
    fontStyle: 'italic',
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientButton: {
    backgroundColor: theme.COLORS.gray[100],
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.md,
    marginRight: theme.SPACING.xs,
    marginBottom: theme.SPACING.xs,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
  },
  selectedIngredientButton: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
  },
  ingredientButtonText: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.text,
  },
  selectedIngredientButtonText: {
    color: theme.COLORS.white,
  },
  recipeCard: {
    marginBottom: theme.SPACING.sm,
    padding: theme.SPACING.md,
  },
  recipeTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.xs,
  },
  recipeDescription: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
    marginBottom: theme.SPACING.sm,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.SPACING.xs,
  },
  matchText: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
    marginLeft: theme.SPACING.xs,
  },
  missingIcon: {
    marginLeft: theme.SPACING.sm,
  },
  missingText: {
    color: theme.COLORS.warning,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SPACING.xl,
  },
  emptyStateText: {
    marginTop: theme.SPACING.md,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[500],
    textAlign: 'center',
  },
  noResultsText: {
    color: theme.COLORS.gray[500],
    fontStyle: 'italic',
    padding: theme.SPACING.md,
  },
  rtlText: {
    textAlign: 'right',
  },
  rtlContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  rtlSearchInputContainer: {
    flexDirection: 'row-reverse',
  },
  rtlSearchInput: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: theme.SPACING.sm,
  },
  rtlSelectedIngredient: {
    flexDirection: 'row-reverse',
    marginRight: 0,
    marginLeft: theme.SPACING.xs,
  },
  rtlMargin: {
    marginRight: 0,
    marginLeft: theme.SPACING.xs,
  },
  rtlIngredientButton: {
    marginRight: 0,
    marginLeft: theme.SPACING.xs,
  },
  rtlMatchInfo: {
    flexDirection: 'row-reverse',
  },
  rtlMatchText: {
    marginLeft: 0,
    marginRight: theme.SPACING.xs,
  },
});

export default IngredientSuggestScreen;
