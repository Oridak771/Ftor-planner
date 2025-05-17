import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  I18nManager,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import theme from '../components/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { commonIngredients } from '../data/commonIngredients'; // Added
import { t } from '../locales/i18n';

const STORAGE_KEY = 'recipes';

const RecipeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: [],
    instructions: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    category: ''
  });

  // State for ingredient input and suggestions
  const [ingredientInput, setIngredientInput] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);

  const allCategories = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch', value: 'lunch' },
    { label: 'Dinner', value: 'dinner' },
    { label: 'Dessert', value: 'dessert' },
  ];

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const savedRecipes = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert(t('error'), t('loadRecipesError'));
    }
  };

  const saveRecipes = async (updatedRecipes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error('Error saving recipes:', error);
      Alert.alert(t('error'), t('saveRecipesError'));
    }
  };

  const handleSave = () => {
    if (!newRecipe.title.trim()) {
      Alert.alert(t('error'), t('titleRequired'));
      return;
    }

    const recipeToSave = {
      id: editingRecipe?.id || Date.now().toString(),
      ...newRecipe,
      createdAt: editingRecipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRecipes = editingRecipe
      ? recipes.map(recipe => recipe.id === editingRecipe.id ? recipeToSave : recipe)
      : [...recipes, recipeToSave];

    saveRecipes(updatedRecipes);
    setIsModalVisible(false);
    resetForm();
  };

  const handleDelete = (id) => {
    Alert.alert(
      t('deleteRecipe'),
      t('deleteRecipeConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          onPress: () => {
            const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
            saveRecipes(updatedRecipes);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const resetForm = () => {
    setNewRecipe({
      title: '',
      description: '',
      ingredients: [],
      instructions: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      category: ''
    });
    setEditingRecipe(null);
  };

  const startEdit = (recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      title: recipe.title,
      description: recipe.description || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || '',
      prepTime: recipe.prepTime || '',
      cookTime: recipe.cookTime || '',
      servings: recipe.servings || '',
      category: recipe.category || ''
    });
    setIsModalVisible(true);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }) => (
    <Card style={styles.recipeCard}>
      <View style={[styles.recipeHeader, I18nManager.isRTL && styles.rtlRecipeHeader]}>
        <Text style={[styles.recipeTitle, I18nManager.isRTL && styles.rtlText]}>
          {item.title}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => startEdit(item)}
          >
            <MaterialIcons name="edit" size={24} color={theme.COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <MaterialIcons name="delete" size={24} color={theme.COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.recipeDescription, I18nManager.isRTL && styles.rtlText]}>
          {item.description}
        </Text>
      )}

      <View style={[styles.recipeDetails, I18nManager.isRTL && styles.rtlRecipeDetails]}>
        {item.prepTime && (
          <View style={[styles.detailItem, I18nManager.isRTL && styles.rtlDetailItem]}>
            <MaterialIcons name="access-time" size={20} color={theme.COLORS.primary} />
            <Text style={[styles.detailText, I18nManager.isRTL && styles.rtlDetailText]}>
              {t('prep')}: {item.prepTime} {t('minutes')}
            </Text>
          </View>
        )}

        {item.cookTime && (
          <View style={[styles.detailItem, I18nManager.isRTL && styles.rtlDetailItem]}>
            <MaterialIcons name="microwave" size={20} color={theme.COLORS.primary} />
            <Text style={[styles.detailText, I18nManager.isRTL && styles.rtlDetailText]}>
              {t('cook')}: {item.cookTime} {t('minutes')}
            </Text>
          </View>
        )}

        {item.servings && (
          <View style={[styles.detailItem, I18nManager.isRTL && styles.rtlDetailItem]}>
            <MaterialIcons name="people" size={20} color={theme.COLORS.primary} />
            <Text style={[styles.detailText, I18nManager.isRTL && styles.rtlDetailText]}>
              {t('serves')}: {item.servings}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, I18nManager.isRTL && styles.rtlSearchContainer]}>
        <MaterialIcons name="search" size={24} color={theme.COLORS.gray[400]} />
        <TextInput
          style={[styles.searchInput, I18nManager.isRTL && styles.rtlSearchInput]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('searchRecipes')}
          placeholderTextColor={theme.COLORS.gray[400]}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />
      </View>

      {recipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="menu-book" size={64} color={theme.COLORS.gray[300]} />
          <Text style={styles.emptyStateText}>{t('noRecipes')}</Text>
          <Button
            title={t('addYourFirstRecipe')}
            onPress={() => {
              resetForm();
              setIsModalVisible(true);
            }}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setIsModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={24} color={theme.COLORS.white} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRecipe ? t('editRecipe') : t('addRecipe')}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <Text style={styles.label}>{t('title')}</Text>
              <TextInput
                style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
                value={newRecipe.title}
                onChangeText={text => setNewRecipe({ ...newRecipe, title: text })}
                placeholder={t('enterRecipeTitle')}
                placeholderTextColor={theme.COLORS.gray[400]}
                textAlign={I18nManager.isRTL ? 'right' : 'left'}
              />

              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, I18nManager.isRTL && styles.rtlInput]}
                value={newRecipe.description}
                onChangeText={text => setNewRecipe({ ...newRecipe, description: text })}
                placeholder={t('enterRecipeDescription')}
                placeholderTextColor={theme.COLORS.gray[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                textAlign={I18nManager.isRTL ? 'right' : 'left'}
              />
              <Text style={styles.label}>{t('ingredients')}</Text>
              {/* Display selected ingredients as chips */}
              <View style={styles.selectedIngredientsContainer}>
                {newRecipe.ingredients.map((ingredientKey, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectedIngredientChip}
                    onPress={() => {
                      const updatedIngredients = newRecipe.ingredients.filter(item => item !== ingredientKey);
                      setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
                    }}
                  >
                    <Text style={styles.selectedIngredientChipText}>
                      {ingredientKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Text>
                    <MaterialIcons name="close" size={16} color={theme.COLORS.white} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input for adding ingredients with autocomplete */}
              <TextInput
                style={[styles.input, I18nManager.isRTL && styles.rtlInput, { marginBottom: filteredIngredients.length > 0 ? 0 : theme.SPACING.md }]}
                value={ingredientInput}
                onChangeText={(text) => {
                  setIngredientInput(text);
                  if (text) {
                    // Filter canonical keys by translated label
                    const suggestions = commonIngredients
                      .filter(ingKey => {
                        const label = t(`ingredientsList.${ingKey.toLowerCase()}`, { defaultValue: ingKey });
                        return label.toLowerCase().includes(text.toLowerCase());
                      })
                      .filter(ingKey => !newRecipe.ingredients.includes(ingKey)); // Only canonical keys in state
                    setFilteredIngredients(suggestions.slice(0, 5));
                  } else {
                    setFilteredIngredients([]);
                  }
                }}
                placeholder={t('addIngredientPlaceholder')}
                placeholderTextColor={theme.COLORS.gray[400]}
                textAlign={I18nManager.isRTL ? 'right' : 'left'}
              />

              {/* Suggestions List */}
              {filteredIngredients.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                     {filteredIngredients.map((ingKey, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          if (!newRecipe.ingredients.includes(ingKey)) {
                            setNewRecipe({
                              ...newRecipe,
                              ingredients: [...newRecipe.ingredients, ingKey], // Store canonical key only
                            });
                          }
                          setIngredientInput('');
                          setFilteredIngredients([]);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.suggestionText}>
                          {ingKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.label}>{t('instructions')}</Text>
              <TextInput
                style={[styles.input, styles.textArea, I18nManager.isRTL && styles.rtlInput]}
                value={newRecipe.instructions}
                onChangeText={text => setNewRecipe({ ...newRecipe, instructions: text })}
                placeholder={t('enterInstructions')}
                placeholderTextColor={theme.COLORS.gray[400]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                textAlign={I18nManager.isRTL ? 'right' : 'left'}
              />

              <View style={[styles.row, I18nManager.isRTL && styles.rtlRow]}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>{t('prepTime')}</Text>
                  <TextInput
                    style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
                    value={newRecipe.prepTime}
                    onChangeText={text => setNewRecipe({ ...newRecipe, prepTime: text })}
                    placeholder={t('minutes')}
                    placeholderTextColor={theme.COLORS.gray[400]}
                    keyboardType="numeric"
                    textAlign={I18nManager.isRTL ? 'right' : 'left'}
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>{t('cookTime')}</Text>
                  <TextInput
                    style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
                    value={newRecipe.cookTime}
                    onChangeText={text => setNewRecipe({ ...newRecipe, cookTime: text })}
                    placeholder={t('minutes')}
                    placeholderTextColor={theme.COLORS.gray[400]}
                    keyboardType="numeric"
                    textAlign={I18nManager.isRTL ? 'right' : 'left'}
                  />
                </View>
              </View>

              <View style={[styles.row, I18nManager.isRTL && styles.rtlRow]}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>{t('servings')}</Text>
                  <TextInput
                    style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
                    value={newRecipe.servings}
                    onChangeText={text => setNewRecipe({ ...newRecipe, servings: text })}
                    placeholder={t('enterServings')}
                    placeholderTextColor={theme.COLORS.gray[400]}
                    keyboardType="numeric"
                    textAlign={I18nManager.isRTL ? 'right' : 'left'}
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>{t('category')}</Text>
                  <RNPickerSelect
                    onValueChange={(value) => setNewRecipe({ ...newRecipe, category: value })}
                    items={allCategories}
                    style={pickerSelectStyles}
                    value={newRecipe.category}
                    placeholder={{ label: t('selectCategory'), value: null }}
                    useNativeAndroidPickerStyle={false}
                  />
                </View>
              </View>

              <View style={[styles.buttonContainer, I18nManager.isRTL && styles.rtlButtonContainer]}>
                <Button
                  title={t('cancel')}
                  onPress={() => setIsModalVisible(false)}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title={editingRecipe ? t('update') : t('save')}
                  onPress={handleSave}
                  style={styles.button}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
    borderRadius: theme.BORDER_RADIUS.sm,
    color: theme.COLORS.text,
    paddingRight: 30,
    backgroundColor: theme.COLORS.white,
    marginBottom: theme.SPACING.md,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
    borderRadius: theme.BORDER_RADIUS.sm,
    color: theme.COLORS.text,
    paddingRight: 30,
    backgroundColor: theme.COLORS.white,
    marginBottom: theme.SPACING.md,
  },
  placeholder: {
    color: theme.COLORS.gray[400],
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.white,
    margin: theme.SPACING.md,
    padding: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.md,
    ...theme.SHADOWS.small,
  },
  rtlSearchContainer: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.SPACING.sm,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
  },
  rtlSearchInput: {
    marginLeft: 0,
    marginRight: theme.SPACING.sm,
    textAlign: 'right',
  },
  list: {
    padding: theme.SPACING.md,
  },
  recipeCard: {
    marginBottom: theme.SPACING.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.SPACING.sm,
  },
  rtlRecipeHeader: {
    flexDirection: 'row-reverse',
  },
  recipeTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    flex: 1,
  },
  rtlText: {
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: theme.SPACING.xs,
    marginLeft: theme.SPACING.xs,
  },
  recipeDescription: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[600],
    marginBottom: theme.SPACING.md,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rtlRecipeDetails: {
    flexDirection: 'row-reverse',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.SPACING.md,
    marginBottom: theme.SPACING.sm,
  },
  rtlDetailItem: {
    flexDirection: 'row-reverse',
    marginRight: 0,
    marginLeft: theme.SPACING.md,
  },
  detailText: {
    marginLeft: theme.SPACING.xs,
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
  },
  rtlDetailText: {
    marginLeft: 0,
    marginRight: theme.SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: theme.SPACING.lg,
    bottom: theme.SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.large,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.BORDER_RADIUS.lg,
    borderTopRightRadius: theme.BORDER_RADIUS.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  modalTitle: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  closeButton: {
    padding: theme.SPACING.xs,
  },
  form: {
    padding: theme.SPACING.md,
  },
  label: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.xs,
    marginTop: theme.SPACING.md,
  },
  input: {
    backgroundColor: theme.COLORS.gray[100],
    borderRadius: theme.BORDER_RADIUS.md,
    padding: theme.SPACING.md,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
  },
  rtlInput: {
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -theme.SPACING.xs,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: theme.SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: theme.SPACING.lg,
    marginBottom: theme.SPACING.xl,
  },
  rtlButtonContainer: {
    flexDirection: 'row-reverse',
  },
  button: {
    flex: 1,
    marginHorizontal: theme.SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SPACING.xl,
  },
  emptyStateText: {
    fontSize: theme.FONT_SIZES.lg,
    color: theme.COLORS.gray[500],
    marginVertical: theme.SPACING.lg,
    textAlign: 'center',
  },
  multiSelectContainer: { // This style might be reused or adapted
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.SPACING.md,
  },
  selectedIngredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.SPACING.sm,
  },
  selectedIngredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.BORDER_RADIUS.full,
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    marginRight: theme.SPACING.xs,
    marginBottom: theme.SPACING.xs,
  },
  selectedIngredientChipText: {
    color: theme.COLORS.white,
    fontSize: theme.FONT_SIZES.sm,
  },
  suggestionsContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[200],
    marginTop: -theme.BORDER_RADIUS.md, // To make it appear connected to the input
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: theme.SPACING.md,
    maxHeight: 150, // Ensure it doesn't get too tall
    ...theme.SHADOWS.small,
    zIndex: 10, // Ensure suggestions are on top
  },
  suggestionItem: {
    paddingVertical: theme.SPACING.sm,
    paddingHorizontal: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[100],
  },
  suggestionText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
  },
  // Old ingredientChip styles - can be removed or adapted if needed elsewhere
  ingredientChip: {
    backgroundColor: theme.COLORS.gray[200],
    borderRadius: theme.BORDER_RADIUS.lg,
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    marginRight: theme.SPACING.sm,
    marginBottom: theme.SPACING.sm,
  },
  ingredientChipSelected: {
    backgroundColor: theme.COLORS.primary,
  },
  ingredientChipText: {
    color: theme.COLORS.text,
    fontSize: theme.FONT_SIZES.sm,
  },
  ingredientChipTextSelected: {
    color: theme.COLORS.white,
  },
});

export default RecipeScreen;
