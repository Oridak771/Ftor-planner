import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from './theme';

const Card = ({ 
  children, 
  variant = 'default', 
  style, 
  elevation = 'medium',
}) => {
  // Get shadow based on elevation
  const getShadow = () => {
    switch (elevation) {
      case 'small':
        return theme.SHADOWS.small;
      case 'large':
        return theme.SHADOWS.large;
      default:
        return theme.SHADOWS.medium;
    }
  };

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.COLORS.primary;
      case 'secondary':
        return theme.COLORS.secondary;
      case 'success':
        return theme.COLORS.success;
      case 'warning':
        return theme.COLORS.warning;
      case 'danger':
        return theme.COLORS.danger;
      case 'info':
        return theme.COLORS.info;
      default:
        return theme.COLORS.card;
    }
  };

  return (
    <View
      style={[
        styles.card,
        getShadow(),
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.BORDER_RADIUS.md,
    padding: theme.SPACING.md,
    marginVertical: theme.SPACING.sm,
  },
});

export default Card; 