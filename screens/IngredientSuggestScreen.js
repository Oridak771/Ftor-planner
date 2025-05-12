import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, I18nManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../components/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { commonIngredients } from '../data/commonIngredients';
import { t } from '../locales/i18n';

const IngredientSuggestScreen = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState([]);

  const filteredIngredients = searchQuery
    ? commonIngredients.filter(ing => 
        ing.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commonIngredients;

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(i => i !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const findMatches = async () => {
    try {
      const recipesData = await AsyncStorage.getItem('recipes');
      if (recipesData) {
        const recipes = JSON.parse(recipesData);
        const matches = recipes.filter(recipe => {
          const ingredientList = recipe.ingredients.toLowerCase();
          return selectedIngredients.some(ingredient => 
            ingredientList.includes(ingredient.toLowerCase())
          );
        });
        setMatchedRecipes(matches);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      findMatches();
    } else {
      setMatchedRecipes([]);
    }
  }, [selectedIngredients]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, I18nManager.isRTL && styles.rtlText]}>
          {t('ingredientSuggestions')}
        </Text>
      </View>

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
            {t('selectedIngredients')}
          </Text>
          <View style={[styles.selectedIngredientsContainer, I18nManager.isRTL && styles.rtlContainer]}>
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map(ingredient => (
                <TouchableOpacity
                  key={ingredient}
                  style={[styles.selectedIngredient, I18nManager.isRTL && styles.rtlSelectedIngredient]}
                  onPress={() => toggleIngredient(ingredient)}
                >
                  <Text style={[styles.selectedIngredientText, I18nManager.isRTL && styles.rtlMargin]}>
                    {ingredient}
                  </Text>
                  <MaterialIcons name="close" size={16} color={theme.COLORS.white} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noSelectionText, I18nManager.isRTL && styles.rtlText]}>
                {t('noIngredientsSelected')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, I18nManager.isRTL && styles.rtlText]}>
            {t('commonIngredients')}
          </Text>
          <View style={[styles.ingredientsGrid, I18nManager.isRTL && styles.rtlContainer]}>
            {filteredIngredients.map(ingredient => (
              <TouchableOpacity
                key={ingredient}
                style={[
                  styles.ingredientButton,
                  selectedIngredients.includes(ingredient) && styles.selectedIngredientButton,
                  I18nManager.isRTL && styles.rtlIngredientButton
                ]}
                onPress={() => toggleIngredient(ingredient)}
              >
                <Text 
                  style={[
                    styles.ingredientButtonText,
                    selectedIngredients.includes(ingredient) && styles.selectedIngredientButtonText,
                    I18nManager.isRTL && styles.rtlText
                  ]}
                >
                  {ingredient}
                </Text>
              </TouchableOpacity>
            ))}
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
                    {t('matchesIngredients', {
                      count: selectedIngredients.filter(ing => 
                        recipe.ingredients.toLowerCase().includes(ing.toLowerCase())
                      ).length
                    })}
                  </Text>
                </View>
              </Card>
            ))}
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
  },
  matchText: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
    marginLeft: theme.SPACING.xs,
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
