import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import theme from './theme';
import Card from './Card';
import { t } from '../locales/i18n';

const MealCard = ({ 
  meal, 
  onEdit, 
  onDelete, 
  mealType = 'breakfast',
  renderRightActions,
}) => {
  // Get meal type icon and color
  const getMealTypeInfo = () => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return { 
          icon: 'free-breakfast', 
          color: theme.COLORS.warning,
          label: t('breakfast')
        };
      case 'lunch':
        return { 
          icon: 'restaurant', 
          color: theme.COLORS.success,
          label: t('lunch')
        };
      case 'dinner':
        return { 
          icon: 'dinner-dining', 
          color: theme.COLORS.primary,
          label: t('dinner')
        };
      case 'snack':
        return { 
          icon: 'icecream', 
          color: theme.COLORS.secondary,
          label: t('snack')
        };
      default:
        return { 
          icon: 'restaurant', 
          color: theme.COLORS.info,
          label: t('meal')
        };
    }
  };

  const { icon, color, label } = getMealTypeInfo();

  // Default right swipe actions if not provided
  const defaultRightActions = (progress, dragX) => {
    return (
      <View style={[styles.actionsContainer, I18nManager.isRTL && styles.rtlActionsContainer]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.COLORS.info }]}
          onPress={() => onEdit && onEdit(meal)}
        >
          <MaterialIcons name="edit" size={24} color={theme.COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.COLORS.danger }]}
          onPress={() => onDelete && onDelete(meal.id)}
        >
          <MaterialIcons name="delete" size={24} color={theme.COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={I18nManager.isRTL ? null : (renderRightActions || defaultRightActions)}
      renderLeftActions={I18nManager.isRTL ? (renderRightActions || defaultRightActions) : null}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      <Card style={styles.container}>
        <View style={[styles.content, I18nManager.isRTL && styles.rtlContent]}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: color },
            I18nManager.isRTL ? styles.rtlIconContainer : styles.ltrIconContainer
          ]}>
            <MaterialIcons name={icon} size={24} color={theme.COLORS.white} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.mealName, I18nManager.isRTL && styles.rtlText]}>
              {meal.meal}
            </Text>
            <Text style={[styles.mealType, I18nManager.isRTL && styles.rtlText]}>
              {label}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => onEdit && onEdit(meal)}
          >
            <MaterialIcons name="more-vert" size={24} color={theme.COLORS.gray[600]} />
          </TouchableOpacity>
        </View>
        {meal.notes && (
          <Text style={[
            styles.notes, 
            I18nManager.isRTL ? styles.rtlNotes : styles.ltrNotes,
            I18nManager.isRTL && styles.rtlText
          ]}>
            {meal.notes}
          </Text>
        )}
      </Card>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.SPACING.xs,
    padding: theme.SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rtlContent: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ltrIconContainer: {
    marginRight: theme.SPACING.md,
  },
  rtlIconContainer: {
    marginLeft: theme.SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  mealName: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 2,
    textAlign: 'left',
  },
  mealType: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
    textAlign: 'left',
  },
  rtlText: {
    textAlign: 'right',
  },
  notes: {
    marginTop: theme.SPACING.sm,
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[700],
  },
  ltrNotes: {
    paddingLeft: 56, // Align with the text after icon
  },
  rtlNotes: {
    paddingRight: 56, // Align with the text after icon for RTL
  },
  editButton: {
    padding: theme.SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  rtlActionsContainer: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealCard;