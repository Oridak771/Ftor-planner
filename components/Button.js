import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, I18nManager } from 'react-native';
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

  // Determine button size with RTL support
  const getSizeStyle = () => {
    const baseStyle = {
      paddingVertical: size === 'small' ? theme.SPACING.xs : 
                      size === 'large' ? theme.SPACING.md : 
                      theme.SPACING.sm,
      borderRadius: size === 'small' ? theme.BORDER_RADIUS.sm :
                   size === 'large' ? theme.BORDER_RADIUS.lg :
                   theme.BORDER_RADIUS.md,
    };

    // Handle RTL padding
    if (I18nManager.isRTL) {
      baseStyle.paddingRight = size === 'small' ? theme.SPACING.md :
                              size === 'large' ? theme.SPACING.xl :
                              theme.SPACING.lg;
      baseStyle.paddingLeft = size === 'small' ? theme.SPACING.md :
                             size === 'large' ? theme.SPACING.xl :
                             theme.SPACING.lg;
    } else {
      baseStyle.paddingHorizontal = size === 'small' ? theme.SPACING.md :
                                   size === 'large' ? theme.SPACING.xl :
                                   theme.SPACING.lg;
    }

    return baseStyle;
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
        I18nManager.isRTL && styles.rtl,
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
            I18nManager.isRTL && styles.rtlText,
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
    flexDirection: 'row',
    ...theme.SHADOWS.small,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    writingDirection: 'rtl',
  }
});

export default Button;