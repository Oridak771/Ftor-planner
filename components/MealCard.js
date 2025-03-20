import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import theme from './theme';
import Card from './Card';

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
          label: 'Breakfast'
        };
      case 'lunch':
        return { 
          icon: 'restaurant', 
          color: theme.COLORS.success,
          label: 'Lunch'
        };
      case 'dinner':
        return { 
          icon: 'dinner-dining', 
          color: theme.COLORS.primary,
          label: 'Dinner'
        };
      case 'snack':
        return { 
          icon: 'icecream', 
          color: theme.COLORS.secondary,
          label: 'Snack'
        };
      default:
        return { 
          icon: 'restaurant', 
          color: theme.COLORS.info,
          label: 'Meal'
        };
    }
  };

  const { icon, color, label } = getMealTypeInfo();

  // Default right swipe actions if not provided
  const defaultRightActions = (progress, dragX) => {
    return (
      <View style={styles.actionsContainer}>
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
      renderRightActions={renderRightActions || defaultRightActions}
      friction={2}
      rightThreshold={40}
    >
      <Card style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <MaterialIcons name={icon} size={24} color={theme.COLORS.white} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.mealName}>{meal.meal}</Text>
            <Text style={styles.mealType}>{label}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => onEdit && onEdit(meal)}
          >
            <MaterialIcons name="more-vert" size={24} color={theme.COLORS.gray[600]} />
          </TouchableOpacity>
        </View>
        {meal.notes && (
          <Text style={styles.notes}>{meal.notes}</Text>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  mealName: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 2,
  },
  mealType: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
  },
  notes: {
    marginTop: theme.SPACING.sm,
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[700],
    paddingLeft: 56, // Align with the text after icon
  },
  editButton: {
    padding: theme.SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealCard; 