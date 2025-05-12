import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  I18nManager
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../components/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { t } from '../locales/i18n';

const STORAGE_KEY = 'shoppingList';

const ShoppingListScreen = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert(t('error'), t('loadItemsError'));
    }
  };

  const saveItems = async (updatedItems) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Error saving items:', error);
      Alert.alert(t('error'), t('saveItemsError'));
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    const updatedItems = [...items, {
      id: Date.now().toString(),
      text: newItem.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }];

    saveItems(updatedItems);
    setNewItem('');
  };

  const toggleItem = (id) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveItems(updatedItems);
  };

  const startEditItem = (item) => {
    setEditingItem(item);
    setNewItem(item.text);
  };

  const updateItem = () => {
    if (!newItem.trim() || !editingItem) return;

    const updatedItems = items.map(item =>
      item.id === editingItem.id ? { ...item, text: newItem.trim() } : item
    );

    saveItems(updatedItems);
    setNewItem('');
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    Alert.alert(
      t('deleteItem'),
      t('deleteItemConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          onPress: () => {
            const updatedItems = items.filter(item => item.id !== id);
            saveItems(updatedItems);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const clearCompleted = () => {
    if (items.some(item => item.completed)) {
      Alert.alert(
        t('clearCompleted'),
        t('clearCompletedConfirm'),
        [
          {
            text: t('cancel'),
            style: 'cancel'
          },
          {
            text: t('clear'),
            onPress: () => {
              const updatedItems = items.filter(item => !item.completed);
              saveItems(updatedItems);
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <TouchableOpacity 
        style={[styles.itemContainer, I18nManager.isRTL && styles.rtlItemContainer]} 
        onPress={() => toggleItem(item.id)}
      >
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleItem(item.id)}
        >
          <MaterialIcons
            name={item.completed ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={item.completed ? theme.COLORS.primary : theme.COLORS.gray[400]}
          />
        </TouchableOpacity>

        <Text 
          style={[
            styles.itemText,
            item.completed && styles.completedText,
            I18nManager.isRTL && styles.rtlText
          ]}
        >
          {item.text}
        </Text>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => startEditItem(item)}
          >
            <MaterialIcons name="edit" size={20} color={theme.COLORS.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteItem(item.id)}
          >
            <MaterialIcons name="delete" size={20} color={theme.COLORS.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={[styles.inputContainer, I18nManager.isRTL && styles.rtlInputContainer]}>
          <TextInput
            style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
            value={newItem}
            onChangeText={setNewItem}
            placeholder={editingItem ? t('updateItem') : t('addItem')}
            placeholderTextColor={theme.COLORS.gray[400]}
            returnKeyType="done"
            onSubmitEditing={editingItem ? updateItem : addItem}
            textAlign={I18nManager.isRTL ? 'right' : 'left'}
          />
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={editingItem ? updateItem : addItem}
          >
            <MaterialIcons
              name={editingItem ? 'check' : 'add'}
              size={24}
              color={theme.COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {items.length > 0 ? (
          <>
            <FlatList
              data={items.sort((a, b) => {
                if (a.completed === b.completed) {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return a.completed ? 1 : -1;
              })}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />

            {items.some(item => item.completed) && (
              <Button
                title={t('clearCompleted')}
                onPress={clearCompleted}
                variant="danger"
                style={styles.clearButton}
              />
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="shopping-cart" 
              size={64} 
              color={theme.COLORS.gray[300]} 
            />
            <Text style={styles.emptyStateText}>{t('noItems')}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  content: {
    flex: 1,
    padding: theme.SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: theme.SPACING.md,
  },
  rtlInputContainer: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.md,
    padding: theme.SPACING.md,
    marginRight: theme.SPACING.sm,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    ...theme.SHADOWS.small,
  },
  rtlInput: {
    textAlign: 'right',
    marginRight: 0,
    marginLeft: theme.SPACING.sm,
  },
  addButton: {
    backgroundColor: theme.COLORS.primary,
    width: 50,
    borderRadius: theme.BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.small,
  },
  list: {
    flex: 1,
  },
  itemCard: {
    marginBottom: theme.SPACING.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SPACING.sm,
  },
  rtlItemContainer: {
    flexDirection: 'row-reverse',
  },
  checkbox: {
    marginRight: theme.SPACING.sm,
  },
  itemText: {
    flex: 1,
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    marginHorizontal: theme.SPACING.sm,
  },
  rtlText: {
    textAlign: 'right',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.COLORS.gray[400],
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.SPACING.xs,
    marginLeft: theme.SPACING.xs,
  },
  clearButton: {
    marginTop: theme.SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: theme.FONT_SIZES.lg,
    color: theme.COLORS.gray[500],
    marginTop: theme.SPACING.md,
  },
});

export default ShoppingListScreen;
