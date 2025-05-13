import React, { useRef, useEffect } from 'react'; // Removed createRef
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  I18nManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from './theme';
import { t } from '../locales/i18n';

const DaySelector = ({
  selectedDay,
  onSelectDay,
  onAddMeal,
  showAddButton = false,
  isNextWeek = false,
  daysOfWeek = [],
}) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const scrollViewRef = useRef(null);

  const translateDay = (day) => {
    return t(day.toLowerCase());
  };

  const isToday = (day) => {
    return day === today && !isNextWeek;
  };

  useEffect(() => {
    if (scrollViewRef.current && daysOfWeek.length > 0) {
      const todayIndex = daysOfWeek.findIndex(day => isToday(day));

      if (todayIndex !== -1) {
        const timer = setTimeout(() => {
          if (scrollViewRef.current) {
            const buttonStyle = styles.dayButton || {};
            const scrollStyle = styles.scrollContent || {};
            const buttonWidth = buttonStyle.minWidth || 75;
            const buttonMargin = buttonStyle.marginHorizontal || theme.SPACING.xs;
            const scrollPadding = scrollStyle.paddingHorizontal || theme.SPACING.md;

            const targetX = todayIndex * (buttonWidth + buttonMargin * 2);
            const scrollToX = targetX - scrollPadding;

            scrollViewRef.current.scrollTo({
              x: scrollToX >= 0 ? scrollToX : 0,
              animated: true
            });
          }
        }, 150);

        return () => clearTimeout(timer);
      }
    }
  }, [daysOfWeek, isNextWeek, today, styles.dayButton, styles.scrollContent]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {daysOfWeek.map((day, index) => {
          const isCurrentToday = isToday(day);
          const isSelected = selectedDay === day;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                isCurrentToday && styles.todayButtonHighlight,
                isSelected && styles.selectedDayButton,
              ]}
              onPress={() => onSelectDay(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  isCurrentToday && !isSelected && styles.todayDayText,
                  isSelected && styles.selectedDayText,
                  I18nManager.isRTL && styles.rtlText
                ]}
              >
                {translateDay(day)}
              </Text>
              {isCurrentToday && !isSelected && <View style={styles.todayDot} />}
              {showAddButton && (
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    I18nManager.isRTL ? styles.rtlAddButtonPosition : styles.ltrAddButtonPosition
                  ]}
                  onPress={() => onAddMeal && onAddMeal(day)}
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={22}
                    color={isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(94, 114, 228, 0.7)'}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.SPACING.sm,
    marginBottom: theme.SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: theme.SPACING.md,
    alignItems: 'center',
  },
  dayButton: {
    minWidth: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.lg,
    marginHorizontal: theme.SPACING.xs,
    padding: theme.SPACING.sm,
    ...(theme && theme.SHADOWS && theme.SHADOWS.small ? theme.SHADOWS.small : {}),
    borderWidth: 1,
    borderColor: theme.COLORS.gray[200],
  },
  todayButtonHighlight: {
    borderColor: theme.COLORS.secondary,
    borderWidth: 2,
  },
  selectedDayButton: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.dark,
    ...(theme && theme.SHADOWS && theme.SHADOWS.medium ? theme.SHADOWS.medium : {}),
  },
  dayText: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.text,
    textAlign: 'center',
  },
  todayDayText: {
    color: theme.COLORS.secondary,
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: theme.COLORS.white,
    fontWeight: 'bold',
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.COLORS.secondary,
    position: 'absolute',
    bottom: theme.SPACING.xs,
  },
  addButton: {
    position: 'absolute',
    padding: 2,
  },
  ltrAddButtonPosition: {
    top: theme.SPACING.xs - 2,
    right: theme.SPACING.xs - 2,
  },
  rtlAddButtonPosition: {
    top: theme.SPACING.xs - 2,
    left: theme.SPACING.xs - 2,
  },
  rtlText: {},
});

export default DaySelector;