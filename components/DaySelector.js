import React, { useRef, useEffect, useState } from 'react';
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
  const scrollViewRef = useRef(null);
  const [dayLayouts, setDayLayouts] = useState({});

  const translateDay = (day) => {
    return t(day.toLowerCase());
  };

  const getTodayString = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    const todayString = getTodayString();
    const currentIsToday = (day) => day === todayString && !isNextWeek;

    if (scrollViewRef.current && daysOfWeek.length > 0) {
      const todayEntry = daysOfWeek.find(day => currentIsToday(day));

      if (todayEntry) {
        const layoutOfToday = dayLayouts[todayEntry];
        if (layoutOfToday && typeof layoutOfToday.x === 'number') {
          scrollViewRef.current.scrollTo({ x: layoutOfToday.x, animated: true });
        }
      }
    }
  }, [daysOfWeek, dayLayouts, isNextWeek]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {daysOfWeek.map((day, index) => {
          const todayString = getTodayString();
          const isCurrentToday = day === todayString && !isNextWeek;
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
              onLayout={(event) => {
                const { x } = event.nativeEvent.layout;
                if (!dayLayouts[day] || dayLayouts[day].x !== x) {
                  setDayLayouts(prevLayouts => ({
                    ...prevLayouts,
                    [day]: { x },
                  }));
                }
              }}
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