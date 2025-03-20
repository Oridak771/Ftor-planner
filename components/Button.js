import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from './theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  // Determine button style based on variant
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.COLORS.secondary };
      case 'success':
        return { backgroundColor: theme.COLORS.success };
      case 'danger':
        return { backgroundColor: theme.COLORS.danger };
      case 'warning':
        return { backgroundColor: theme.COLORS.warning };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: theme.COLORS.primary 
        };
      case 'ghost':
        return { 
          backgroundColor: 'transparent',
        };
      default:
        return { backgroundColor: theme.COLORS.primary };
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    if (variant === 'outline') {
      return theme.COLORS.primary;
    } else if (variant === 'ghost') {
      return theme.COLORS.primary;
    } else {
      return theme.COLORS.white;
    }
  };

  // Determine button size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { 
          paddingVertical: theme.SPACING.xs,
          paddingHorizontal: theme.SPACING.md,
          borderRadius: theme.BORDER_RADIUS.sm,
        };
      case 'large':
        return { 
          paddingVertical: theme.SPACING.md,
          paddingHorizontal: theme.SPACING.xl,
          borderRadius: theme.BORDER_RADIUS.lg,
        };
      default:
        return { 
          paddingVertical: theme.SPACING.sm,
          paddingHorizontal: theme.SPACING.lg,
          borderRadius: theme.BORDER_RADIUS.md,
        };
    }
  };

  // Get font size based on button size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.FONT_SIZES.sm;
      case 'large':
        return theme.FONT_SIZES.lg;
      default:
        return theme.FONT_SIZES.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        <Text 
          style={[
            styles.text, 
            { color: getTextColor(), fontSize: getFontSize() },
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.SHADOWS.small,
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button; 