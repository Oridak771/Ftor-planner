// Theme configuration for the app
const COLORS = {
  primary: '#5E72E4',       // Modern blue
  secondary: '#11CDEF',     // Cyan
  success: '#2DCE89',       // Green
  warning: '#FB6340',       // Orange
  danger: '#F5365C',        // Red
  info: '#6772E5',          // Purple
  light: '#F7FAFC',         // Light gray
  dark: '#32325D',          // Dark blue
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F6F9FC',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#8898AA',
    700: '#525F7F',
    800: '#32325D',
    900: '#212529',
  },
  background: '#F7FAFC',
  card: '#FFFFFF',
  text: '#32325D',
  border: '#E9ECEF',
};

const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
}; 