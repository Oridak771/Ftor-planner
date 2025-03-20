import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from './theme';

const DaySelector = ({ 
  selectedDay, 
  onSelectDay, 
  onAddMeal,
  compact = false,
  showAddButton = true,
  isNextWeek = false,
  daysOfWeek = null,
}) => {
  // Default days of week if not provided
  const defaultDaysOfWeek = [
    { id: 'Monday', short: 'Mon' },
    { id: 'Tuesday', short: 'Tue' },
    { id: 'Wednesday', short: 'Wed' },
    { id: 'Thursday', short: 'Thu' },
    { id: 'Friday', short: 'Fri' },
    { id: 'Saturday', short: 'Sat' },
    { id: 'Sunday', short: 'Sun' },
  ];

  // Use provided days or default
  const days = daysOfWeek ? 
    daysOfWeek.map(day => ({ id: day, short: day.substring(0, 3) })) : 
    defaultDaysOfWeek;

  // Get current day of week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Completely rewritten date calculation function
  const getDayDate = (dayName) => {
    // Get current date
    const now = new Date();
    
    // Map day names to their index values (0-6)
    const dayIndices = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    
    // Get the current day of the week (0-6)
    const currentDayIndex = now.getDay();
    
    // Get the target day index
    const targetDayIndex = dayIndices[dayName];
    
    // Calculate the difference between target day and current day
    let daysDifference = targetDayIndex - currentDayIndex;
    
    // Adjust if the target day is earlier in the week
    if (daysDifference < 0) {
      daysDifference += 7;
    }
    
    // Create a new date for the target day in the current week
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysDifference);
    
    // If we're looking at next week, add 7 days
    if (isNextWeek) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    // Return the day of the month
    return targetDate.getDate();
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          fadingEdgeLength={50}
          decelerationRate="fast"
          snapToInterval={120}
          snapToAlignment="start"
          overScrollMode="never"
        >
          {days.map((day) => {
            const isSelected = selectedDay === day.id;
            const isToday = !isNextWeek && today === day.id;
            
            return (
              <View key={day.id} style={styles.dayTabWrapper}>
                <TouchableOpacity
                  style={[
                    styles.dayTab,
                    isSelected && styles.selectedDayTab,
                    compact && styles.compactDayTab,
                  ]}
                  onPress={() => onSelectDay(day.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayNameContainer}>
                    <Text style={[
                      styles.dayName,
                      isSelected && styles.selectedDayText,
                      compact && styles.compactDayText,
                    ]}>
                      {compact ? day.short : day.id}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.dateCircle,
                    isSelected && styles.selectedDateCircle,
                    isToday && styles.todayCircle,
                  ]}>
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.selectedDateText,
                      isToday && styles.todayText,
                    ]}>
                      {getDayDate(day.id)}
                    </Text>
                  </View>
                  
                  {showAddButton && isSelected && (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => onAddMeal && onAddMeal(day.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="add" size={18} color={theme.COLORS.white} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    paddingVertical: theme.SPACING.md,
  },
  container: {
    minHeight: 150,
    maxHeight: 180,
    paddingVertical: theme.SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
  },
  dayTabWrapper: {
    padding: theme.SPACING.sm,
    marginRight: theme.SPACING.sm,
  },
  dayTab: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.SPACING.lg,
    paddingHorizontal: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.lg,
    backgroundColor: theme.COLORS.white,
    ...theme.SHADOWS.small,
    minWidth: 110,
    minHeight: 130,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[200],
  },
  selectedDayTab: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
    ...theme.SHADOWS.medium,
    transform: [{ scale: 1.05 }],
  },
  compactDayTab: {
    minWidth: 90,
    minHeight: 110,
    paddingVertical: theme.SPACING.md,
    paddingHorizontal: theme.SPACING.sm,
  },
  dayNameContainer: {
    width: '100%',
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.sm,
    marginBottom: theme.SPACING.sm,
  },
  dayName: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: '700',
    color: theme.COLORS.text,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedDayText: {
    color: theme.COLORS.white,
  },
  compactDayText: {
    fontSize: theme.FONT_SIZES.md,
  },
  dateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
    marginTop: theme.SPACING.xs,
  },
  selectedDateCircle: {
    backgroundColor: theme.COLORS.white,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  todayCircle: {
    backgroundColor: theme.COLORS.warning,
    borderColor: theme.COLORS.warning,
  },
  dateText: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: '800',
    color: theme.COLORS.text,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedDateText: {
    color: theme.COLORS.primary,
  },
  todayText: {
    color: theme.COLORS.white,
  },
  addButton: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.SHADOWS.medium,
    borderWidth: 2,
    borderColor: theme.COLORS.white,
    zIndex: 10,
    elevation: 6,
  },
});

export default DaySelector; 