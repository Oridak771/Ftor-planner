import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../App';
import theme from '../components/theme';
import Card from '../components/Card';
import Button from '../components/Button';

const RecipeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    imageUrl: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    category: 'main',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(
        recipe => 
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

    const fetchRecipes = async () => {
    setRefreshing(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      const recipesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddRecipe = async () => {
    if (!newRecipe.title.trim()) return;
    
    setIsLoading(true);
    try {
      const recipeData = {
        ...newRecipe,
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'recipes'), recipeData);
      setNewRecipe({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        imageUrl: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        category: 'main',
      });
      setShowAddModal(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error adding recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
    fetchRecipes();
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const renderRecipeCard = ({ item }) => {
  return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => setSelectedRecipe(item)}
      >
        <View style={styles.recipeCardContent}>
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.recipePlaceholder}>
              <MaterialIcons name="restaurant" size={40} color={theme.COLORS.gray[400]} />
            </View>
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            {item.description && (
              <Text 
                style={styles.recipeDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            <View style={styles.recipeMetaContainer}>
              {item.prepTime && (
                <View style={styles.recipeMeta}>
                  <MaterialIcons name="access-time" size={16} color={theme.COLORS.gray[600]} />
                  <Text style={styles.recipeMetaText}>{item.prepTime} min</Text>
                </View>
              )}
              {item.servings && (
                <View style={styles.recipeMeta}>
                  <MaterialIcons name="people" size={16} color={theme.COLORS.gray[600]} />
                  <Text style={styles.recipeMetaText}>{item.servings} servings</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const RecipeDetailModal = () => {
    if (!selectedRecipe) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedRecipe}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedRecipe(null)}
              >
                <MaterialIcons name="arrow-back" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteRecipe(selectedRecipe.id)}
              >
                <MaterialIcons name="delete" size={24} color={theme.COLORS.danger} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.recipeDetailScroll}>
              {selectedRecipe.imageUrl ? (
                <Image 
                  source={{ uri: selectedRecipe.imageUrl }} 
                  style={styles.recipeDetailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.recipeDetailPlaceholder}>
                  <MaterialIcons name="restaurant" size={60} color={theme.COLORS.gray[400]} />
                </View>
              )}
              
              <View style={styles.recipeDetailContent}>
                <Text style={styles.recipeDetailTitle}>{selectedRecipe.title}</Text>
                
                {selectedRecipe.description && (
                  <Text style={styles.recipeDetailDescription}>
                    {selectedRecipe.description}
                  </Text>
                )}
                
                <View style={styles.recipeDetailMeta}>
                  {selectedRecipe.prepTime && (
                    <View style={styles.recipeDetailMetaItem}>
                      <MaterialIcons name="access-time" size={20} color={theme.COLORS.primary} />
                      <View>
                        <Text style={styles.recipeDetailMetaLabel}>Prep Time</Text>
                        <Text style={styles.recipeDetailMetaValue}>{selectedRecipe.prepTime} min</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedRecipe.cookTime && (
                    <View style={styles.recipeDetailMetaItem}>
                      <MaterialIcons name="whatshot" size={20} color={theme.COLORS.warning} />
                      <View>
                        <Text style={styles.recipeDetailMetaLabel}>Cook Time</Text>
                        <Text style={styles.recipeDetailMetaValue}>{selectedRecipe.cookTime} min</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedRecipe.servings && (
                    <View style={styles.recipeDetailMetaItem}>
                      <MaterialIcons name="people" size={20} color={theme.COLORS.success} />
                      <View>
                        <Text style={styles.recipeDetailMetaLabel}>Servings</Text>
                        <Text style={styles.recipeDetailMetaValue}>{selectedRecipe.servings}</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {selectedRecipe.ingredients && (
                  <View style={styles.recipeDetailSection}>
                    <Text style={styles.recipeDetailSectionTitle}>Ingredients</Text>
                    <Text style={styles.recipeDetailText}>{selectedRecipe.ingredients}</Text>
                  </View>
                )}
                
                {selectedRecipe.instructions && (
                  <View style={styles.recipeDetailSection}>
                    <Text style={styles.recipeDetailSectionTitle}>Instructions</Text>
                    <Text style={styles.recipeDetailText}>{selectedRecipe.instructions}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const AddRecipeModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipe</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.addRecipeForm}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newRecipe.title}
                onChangeText={(text) => setNewRecipe({...newRecipe, title: text})}
                placeholder="Recipe title"
                placeholderTextColor={theme.COLORS.gray[500]}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRecipe.description}
                onChangeText={(text) => setNewRecipe({...newRecipe, description: text})}
                placeholder="Brief description of the recipe"
                placeholderTextColor={theme.COLORS.gray[500]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Prep Time (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={newRecipe.prepTime}
                    onChangeText={(text) => setNewRecipe({...newRecipe, prepTime: text})}
                    placeholder="30"
                    placeholderTextColor={theme.COLORS.gray[500]}
                    keyboardType="number-pad"
                  />
                </View>
                
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Cook Time (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={newRecipe.cookTime}
                    onChangeText={(text) => setNewRecipe({...newRecipe, cookTime: text})}
                    placeholder="45"
                    placeholderTextColor={theme.COLORS.gray[500]}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Servings</Text>
                  <TextInput
                    style={styles.input}
                    value={newRecipe.servings}
                    onChangeText={(text) => setNewRecipe({...newRecipe, servings: text})}
                    placeholder="4"
                    placeholderTextColor={theme.COLORS.gray[500]}
                    keyboardType="number-pad"
                  />
                </View>
                
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.categoryContainer}>
                    {['main', 'side', 'dessert', 'breakfast'].map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          newRecipe.category === category && styles.selectedCategory
                        ]}
                        onPress={() => setNewRecipe({...newRecipe, category})}
                      >
                        <Text 
                          style={[
                            styles.categoryText,
                            newRecipe.category === category && styles.selectedCategoryText
                          ]}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={newRecipe.imageUrl}
                onChangeText={(text) => setNewRecipe({...newRecipe, imageUrl: text})}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={theme.COLORS.gray[500]}
              />
              
              <Text style={styles.inputLabel}>Ingredients</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRecipe.ingredients}
                onChangeText={(text) => setNewRecipe({...newRecipe, ingredients: text})}
                placeholder="List ingredients, one per line"
                placeholderTextColor={theme.COLORS.gray[500]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
              
              <Text style={styles.inputLabel}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRecipe.instructions}
                onChangeText={(text) => setNewRecipe({...newRecipe, instructions: text})}
                placeholder="Step-by-step instructions"
                placeholderTextColor={theme.COLORS.gray[500]}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              
              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                />
                <Button
                  title="Save Recipe"
                  onPress={handleAddRecipe}
                  loading={isLoading}
                  disabled={!newRecipe.title.trim()}
                  style={styles.saveButton}
                />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color={theme.COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={theme.COLORS.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.COLORS.gray[500]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={theme.COLORS.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipeList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchRecipes}
            colors={[theme.COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="restaurant-menu" size={60} color={theme.COLORS.gray[400]} />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No matching recipes found' : 'No recipes yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try a different search term or add a new recipe'
                : 'Add your favorite recipes to get started'
              }
            </Text>
            <Button
              title="Add Your First Recipe"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyStateButton}
            />
          </View>
        }
      />
      
      <RecipeDetailModal />
      <AddRecipeModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: theme.COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: theme.BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.small,
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
  recipeList: {
    paddingHorizontal: theme.SPACING.md,
    paddingTop: theme.SPACING.sm,
    paddingBottom: theme.SPACING.xl,
  },
  recipeCard: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.lg,
    marginBottom: theme.SPACING.md,
    overflow: 'hidden',
    ...theme.SHADOWS.medium,
  },
  recipeCardContent: {
    flexDirection: 'row',
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: theme.COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
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
    color: theme.COLORS.gray[700],
    marginBottom: theme.SPACING.sm,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.SPACING.md,
  },
  recipeMetaText: {
    fontSize: theme.FONT_SIZES.xs,
    color: theme.COLORS.gray[600],
    marginLeft: theme.SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.SPACING.xl,
    marginTop: theme.SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginTop: theme.SPACING.md,
    marginBottom: theme.SPACING.xs,
  },
  emptyStateText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[600],
    textAlign: 'center',
    marginBottom: theme.SPACING.lg,
  },
  emptyStateButton: {
    marginTop: theme.SPACING.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
  },
  modalContent: {
    flex: 1,
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
  deleteButton: {
    padding: theme.SPACING.xs,
  },
  recipeDetailScroll: {
    flex: 1,
  },
  recipeDetailImage: {
    width: '100%',
    height: 250,
  },
  recipeDetailPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: theme.COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeDetailContent: {
    padding: theme.SPACING.md,
  },
  recipeDetailTitle: {
    fontSize: theme.FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.md,
  },
  recipeDetailDescription: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[700],
    marginBottom: theme.SPACING.lg,
    lineHeight: 22,
  },
  recipeDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.SPACING.lg,
    paddingVertical: theme.SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.gray[200],
  },
  recipeDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeDetailMetaLabel: {
    fontSize: theme.FONT_SIZES.xs,
    color: theme.COLORS.gray[600],
    marginLeft: theme.SPACING.xs,
  },
  recipeDetailMetaValue: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.xs,
  },
  recipeDetailSection: {
    marginBottom: theme.SPACING.lg,
  },
  recipeDetailSectionTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.sm,
  },
  recipeDetailText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[800],
    lineHeight: 24,
  },
  addRecipeForm: {
    padding: theme.SPACING.md,
  },
  inputLabel: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.gray[700],
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formColumn: {
    flex: 1,
    marginRight: theme.SPACING.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.SPACING.lg,
    marginBottom: theme.SPACING.xl,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.SPACING.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: theme.SPACING.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: theme.COLORS.gray[100],
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.md,
    marginRight: theme.SPACING.xs,
    marginBottom: theme.SPACING.xs,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
  },
  selectedCategory: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
  },
  categoryText: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.text,
  },
  selectedCategoryText: {
    color: theme.COLORS.white,
  },
});

export default RecipeScreen;