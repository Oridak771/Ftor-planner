import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  Animated,
  ScrollView,
  Keyboard,
  Pressable
} from 'react-native';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../App';
import theme from '../components/theme';
import Button from '../components/Button';

const MealEditor = ({ onSave, initialMeal, selectedDay, onCancel, availableMealTypes }) => {
  const [meal, setMeal] = useState(initialMeal?.meal || '');
  const [notes, setNotes] = useState(initialMeal?.notes || '');
  const [mealType, setMealType] = useState(initialMeal?.type || '');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const scaleValue = useRef(new Animated.Value(0)).current;

  // Default meal types if none provided from settings
  const defaultMealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: 'free-breakfast' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant' },
    { id: 'dinner', label: 'Dinner', icon: 'dinner-dining' },
    { id: 'snack', label: 'Snack', icon: 'icecream' },
  ];
  
  // Use available meal types from settings or default
  const mealTypes = availableMealTypes || defaultMealTypes;

  useEffect(() => {
    if (initialMeal) {
      setMeal(initialMeal.meal || '');
      setNotes(initialMeal.notes || '');
      setMealType(initialMeal.type || '');
    } else {
      // Set default meal type to first available type
      if (mealTypes.length > 0 && !mealType) {
        setMealType(mealTypes[0].id);
      }
    }
    
    // Reset and start the animation
    scaleValue.setValue(0);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [initialMeal, mealTypes]);

  const handleClose = () => {
    // Animate out before closing
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (onCancel) {
        onCancel();
      } else {
        onSave();
      }
    });
  };

  const saveMeal = async () => {
    if (!meal.trim()) return;
    
    setIsLoading(true);
    try {
      const mealData = {
        day: selectedDay,
        meal: meal.trim(),
        notes: notes.trim(),
        type: mealType,
        createdAt: new Date().toISOString(),
      };

      if (initialMeal) {
        // Update existing meal
        const mealRef = doc(db, 'meals', initialMeal.id);
        await updateDoc(mealRef, mealData);
      } else {
        // Add new meal
        await addDoc(collection(db, 'meals'), mealData);
      }
      
      setMeal('');
      setNotes('');
      setMealType(mealTypes.length > 0 ? mealTypes[0].id : '');
      
      // Animate out before saving
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        onSave();
      });
    } catch (error) {
      console.error('Error saving meal:', error);
      setIsLoading(false);
    }
  };

  // Function to handle background press - only dismiss keyboard
  const handleBackgroundPress = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable 
          style={styles.backgroundDismiss} 
          onPress={handleBackgroundPress}
        >
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <Pressable>
              <Animated.View 
                style={[
                  styles.card,
                  { 
                    transform: [{ scale: scaleValue }],
                    opacity: scaleValue
                  }
                ]}
              >
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {initialMeal ? 'Edit Meal' : 'Add New Meal'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleClose}
                  >
                    <MaterialIcons name="close" size={24} color={theme.COLORS.gray[600]} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.scrollContainer}
                  keyboardShouldPersistTaps="always"
                  contentContainerStyle={styles.scrollContentContainer}
                >
                  <Text style={styles.label}>Day</Text>
                  <View style={styles.dayContainer}>
                    <MaterialIcons name="event" size={24} color={theme.COLORS.primary} />
                    <Text style={styles.dayText}>{selectedDay}</Text>
                  </View>

                  {mealTypes.length > 0 && (
                    <>
                      <Text style={styles.label}>Meal Type</Text>
                      <View style={styles.mealTypeContainer}>
                        {mealTypes.map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            style={[
                              styles.mealTypeButton,
                              mealType === type.id && styles.selectedMealType,
                            ]}
                            onPress={() => setMealType(type.id)}
                          >
                            <MaterialIcons 
                              name={type.icon} 
                              size={24} 
                              color={mealType === type.id ? theme.COLORS.white : theme.COLORS.primary} 
                            />
                            <Text 
                              style={[
                                styles.mealTypeText,
                                mealType === type.id && styles.selectedMealTypeText,
                              ]}
                            >
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <Text style={styles.label}>Meal Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What are you planning to eat?"
                    value={meal}
                    onChangeText={setMeal}
                    placeholderTextColor={theme.COLORS.gray[500]}
                  />

                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      styles.notesInput,
                      keyboardVisible && styles.notesInputKeyboardVisible
                    ]}
                    placeholder="Add ingredients, recipe link, or other notes"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={keyboardVisible ? 2 : 4}
                    textAlignVertical="top"
                    placeholderTextColor={theme.COLORS.gray[500]}
                  />
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleClose}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={initialMeal ? 'Update' : 'Save'}
                    onPress={saveMeal}
                    loading={isLoading}
                    disabled={!meal.trim() || !mealType}
                    style={styles.saveButton}
                  />
                </View>
              </Animated.View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundDismiss: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SPACING.md,
  },
  card: {
    width: '100%',
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.lg,
    ...theme.SHADOWS.large,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  title: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  closeButton: {
    padding: theme.SPACING.xs,
  },
  scrollContainer: {
    padding: theme.SPACING.md,
    maxHeight: 400,
  },
  scrollContentContainer: {
    paddingBottom: theme.SPACING.lg,
  },
  label: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.gray[700],
    marginBottom: theme.SPACING.xs,
    marginTop: theme.SPACING.md,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.gray[100],
    padding: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.md,
  },
  dayText: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.md,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.SPACING.sm,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.gray[100],
    padding: theme.SPACING.sm,
    borderRadius: theme.BORDER_RADIUS.md,
    marginRight: theme.SPACING.sm,
    marginBottom: theme.SPACING.sm,
    minWidth: 100,
  },
  selectedMealType: {
    backgroundColor: theme.COLORS.primary,
  },
  mealTypeText: {
    fontSize: theme.FONT_SIZES.sm,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.xs,
  },
  selectedMealTypeText: {
    color: theme.COLORS.white,
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
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesInputKeyboardVisible: {
    minHeight: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.SPACING.md,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.gray[200],
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.SPACING.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: theme.SPACING.sm,
  },
});

export default MealEditor;