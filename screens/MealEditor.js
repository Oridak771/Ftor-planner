import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  ScrollView,
  I18nManager,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../components/theme';
import Button from '../components/Button';
import { t } from '../locales/i18n';

const MealEditor = ({ 
  isVisible = true,
  onSave, 
  onCancel, 
  initialMeal = null,
  selectedDay,
  availableMealTypes = []
}) => {
  const [meal, setMeal] = useState(initialMeal?.meal || '');
  const [notes, setNotes] = useState(initialMeal?.notes || '');
  const [mealType, setMealType] = useState(initialMeal?.type || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMeal) {
      setMeal(initialMeal.meal || '');
      setNotes(initialMeal.notes || '');
      setMealType(initialMeal.type || '');
    } else if (availableMealTypes.length > 0) {
      setMealType(availableMealTypes[0].id);
    }
  }, [initialMeal, availableMealTypes]);

  const handleSave = async () => {
    if (!meal.trim()) {
      Alert.alert(t('error'), t('mealNameRequired'));
      return;
    }

    if (!mealType) {
      Alert.alert(t('error'), t('mealTypeRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const mealData = {
        id: initialMeal?.id,
        day: selectedDay,
        meal: meal.trim(),
        notes: notes.trim(),
        type: mealType,
      };

      await onSave(mealData);
      setMeal('');
      setNotes('');
      setMealType(availableMealTypes.length > 0 ? availableMealTypes[0].id : '');
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(t('error'), t('saveMealError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialMeal ? t('editMeal') : t('addMeal')}
            </Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>{t('day')}</Text>
            <View style={styles.dayDisplay}>
              <MaterialIcons name="event" size={24} color={theme.COLORS.primary} />
              <Text style={styles.dayText}>{selectedDay}</Text>
            </View>

            <Text style={styles.label}>{t('mealType')}</Text>
            <View style={styles.mealTypeContainer}>
              {availableMealTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.mealTypeButton,
                    mealType === type.id && styles.selectedMealType,
                    I18nManager.isRTL && styles.rtlMealTypeButton
                  ]}
                  onPress={() => setMealType(type.id)}
                >
                  <MaterialIcons 
                    name={type.icon || 'restaurant'} 
                    size={24} 
                    color={mealType === type.id ? theme.COLORS.white : theme.COLORS.primary} 
                  />
                  <Text 
                    style={[
                      styles.mealTypeText,
                      mealType === type.id && styles.selectedMealTypeText,
                      I18nManager.isRTL && styles.rtlText
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('mealName')}</Text>
            <TextInput
              style={[styles.input, I18nManager.isRTL && styles.rtlInput]}
              value={meal}
              onChangeText={setMeal}
              placeholder={t('enterMealName')}
              placeholderTextColor={theme.COLORS.gray[400]}
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            <Text style={styles.label}>{t('notesOptional')}</Text>
            <TextInput
              style={[styles.input, styles.textArea, I18nManager.isRTL && styles.rtlInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('addNotes')}
              placeholderTextColor={theme.COLORS.gray[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              textAlign={I18nManager.isRTL ? 'right' : 'left'}
            />

            <View style={[styles.buttonContainer, I18nManager.isRTL && styles.rtlButtonContainer]}>
              <Button
                title={t('cancel')}
                onPress={onCancel}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={initialMeal ? t('update') : t('save')}
                onPress={handleSave}
                loading={isLoading}
                disabled={!meal.trim() || !mealType}
                style={styles.button}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.BORDER_RADIUS.lg,
    borderTopRightRadius: theme.BORDER_RADIUS.lg,
    maxHeight: '90%',
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
  form: {
    padding: theme.SPACING.md,
  },
  label: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.gray[700],
    marginBottom: theme.SPACING.xs,
    marginTop: theme.SPACING.md,
  },
  dayDisplay: {
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
    minWidth: 120,
  },
  rtlMealTypeButton: {
    flexDirection: 'row-reverse',
    marginRight: 0,
    marginLeft: theme.SPACING.sm,
  },
  selectedMealType: {
    backgroundColor: theme.COLORS.primary,
  },
  mealTypeText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.sm,
  },
  rtlText: {
    marginLeft: 0,
    marginRight: theme.SPACING.sm,
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
  rtlInput: {
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default MealEditor;