import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../App';
import MealEditor from './MealEditor';
import theme from '../components/theme';
import Card from '../components/Card';
import MealCard from '../components/MealCard';
import DaySelector from '../components/DaySelector';
import Button from '../components/Button';

const HomeScreen = () => {
  const [meals, setMeals] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editMeal, setEditMeal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isNextWeek, setIsNextWeek] = useState(false);
  const [enabledMealTypes, setEnabledMealTypes] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  });

  // Get current day of week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    // Set the initial selected day to today
    if (!selectedDay) {
      setSelectedDay(today);
    }
    
    loadSettings();
    fetchMeals();
  }, []);
  
  const loadSettings = async () => {
    try {
      const mealTypesSetting = await AsyncStorage.getItem('mealTypes');
      if (mealTypesSetting !== null) {
        setEnabledMealTypes(JSON.parse(mealTypesSetting));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const fetchMeals = async () => {
    setRefreshing(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'meals'));
      const mealsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort meals by type (breakfast, lunch, dinner, snack)
      const sortedMeals = mealsData.sort((a, b) => {
        const typeOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
        return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
      });
      
      setMeals(sortedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditMeal(null);
    fetchMeals();
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditMeal(null);
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await deleteDoc(doc(db, 'meals', mealId));
      fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleEditMeal = (meal) => {
    setEditMeal(meal);
    setShowEditor(true);
  };

  const handleAddMeal = (day) => {
    setSelectedDay(day);
    setEditMeal(null);
    setShowEditor(true);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
  };

  const toggleWeekView = () => {
    setIsNextWeek(!isNextWeek);
    // When toggling to next week, select the first day of next week
    if (!isNextWeek) {
      // Get the first day of next week (Monday)
      const nextMonday = getNextWeekDay('Monday');
      setSelectedDay(nextMonday);
    } else {
      // When toggling back to this week, select today
      setSelectedDay(today);
    }
  };

  // Get the day name for a day in the next week
  const getNextWeekDay = (dayName) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const dayIndex = daysOfWeek.indexOf(dayName);
    const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to add to get to next week's day
    let daysToAdd = dayIndex - todayIndex + 7; // Add 7 to get to next week
    
    // Create date for next week's day
    const nextWeekDay = new Date(today);
    nextWeekDay.setDate(today.getDate() + daysToAdd);
    
    return daysOfWeek[nextWeekDay.getDay()];
  };

  // Get days for current or next week
  const getWeekDays = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    if (!isNextWeek) {
      return daysOfWeek;
    } else {
      // For next week, we'll return the same day names but they represent next week's days
      return daysOfWeek.map(day => day);
    }
  };

  // Filter meals for today
  const todayMeals = meals.filter((meal) => meal.day === today);
  
  // Filter meals for selected day
  const selectedDayMeals = meals.filter((meal) => meal.day === selectedDay);

  // Group meals by type
  const groupMealsByType = (mealsArray) => {
    const grouped = {};
    mealsArray.forEach(meal => {
      const type = meal.type || 'other';
      // Only include enabled meal types
      if (enabledMealTypes[type] || type === 'other') {
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(meal);
      }
    });
    return grouped;
  };

  const groupedTodayMeals = groupMealsByType(todayMeals);
  const groupedSelectedDayMeals = groupMealsByType(selectedDayMeals);

  // Get meal type label
  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      default: return 'Other';
    }
  };
  
  // Get meal type icon
  const getMealTypeIcon = (type) => {
    switch (type) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'restaurant';
      case 'dinner': return 'dinner-dining';
      case 'snack': return 'icecream';
      default: return 'restaurant';
    }
  };
  
  // Get available meal types for the editor
  const getAvailableMealTypes = () => {
    return Object.keys(enabledMealTypes)
      .filter(type => enabledMealTypes[type])
      .map(type => ({
        id: type,
        label: getMealTypeLabel(type),
        icon: getMealTypeIcon(type)
      }));
  };

  // Get background gradient colors for meal types
  const getMealTypeGradient = (type) => {
    switch (type) {
      case 'breakfast': return ['#FFA726', '#FB8C00'];
      case 'lunch': return ['#66BB6A', '#43A047'];
      case 'dinner': return ['#5E72E4', '#3F51B5'];
      case 'snack': return ['#26C6DA', '#00ACC1'];
      default: return ['#78909C', '#546E7A'];
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <TouchableOpacity 
          style={styles.weekToggle}
          onPress={toggleWeekView}
          activeOpacity={0.7}
        >
          <Text style={styles.weekToggleText}>
            {isNextWeek ? 'Next Week' : 'This Week'}
          </Text>
          <MaterialIcons 
            name={isNextWeek ? 'arrow-back' : 'arrow-forward'} 
            size={20} 
            color={theme.COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              loadSettings();
              fetchMeals();
            }}
            colors={[theme.COLORS.primary]}
          />
        }
      >
        {/* Today's Summary Card */}
        {!isNextWeek && (
          <Card style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <View style={styles.todayTitleContainer}>
                <Text style={styles.todayTitle}>Today</Text>
                <Text style={styles.todayDate}>{today}</Text>
              </View>
              <TouchableOpacity
                style={styles.addTodayButton}
                onPress={() => handleAddMeal(today)}
              >
                <MaterialIcons name="add" size={24} color={theme.COLORS.white} />
              </TouchableOpacity>
            </View>

            {Object.keys(groupedTodayMeals).length > 0 ? (
              <View style={styles.todayMealsContainer}>
                {Object.keys(groupedTodayMeals).map(type => (
                  <View key={type} style={styles.mealTypeSection}>
                    <View style={styles.mealTypeLabelContainer}>
                      <MaterialIcons 
                        name={getMealTypeIcon(type)} 
                        size={20} 
                        color={theme.COLORS.white} 
                      />
                      <Text style={styles.mealTypeTitle}>{getMealTypeLabel(type)}</Text>
                    </View>
                    
                    {groupedTodayMeals[type].map(meal => (
                      <TouchableOpacity 
                        key={meal.id} 
                        style={styles.todayMealItem}
                        onPress={() => handleEditMeal(meal)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.todayMealContent}>
                          <Text style={styles.todayMealText}>{meal.meal}</Text>
                          {meal.notes && (
                            <Text style={styles.todayMealNotes}>{meal.notes}</Text>
                          )}
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="restaurant" size={40} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyStateTextWhite}>No meals planned for today</Text>
                <Button
                  title="Add Your First Meal"
                  variant="outline"
                  onPress={() => handleAddMeal(today)}
                  style={styles.emptyStateButton}
                  textStyle={{ color: theme.COLORS.white }}
                />
              </View>
            )}
          </Card>
        )}

        {/* Weekly Planner Section */}
        <Text style={styles.sectionTitle}>
          {isNextWeek ? 'Next Week Plan' : 'Weekly Plan'}
        </Text>
        
        <DaySelector
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          onAddMeal={handleAddMeal}
          showAddButton={true}
          isNextWeek={isNextWeek}
          daysOfWeek={getWeekDays()}
        />

        {/* Selected Day Meals */}
        <View style={styles.selectedDayContainer}>
          <View style={styles.selectedDayHeader}>
            <View style={styles.selectedDayTitleContainer}>
              <Text style={styles.selectedDayTitle}>{selectedDay}</Text>
              <Text style={styles.selectedDaySubtitle}>
                {isNextWeek ? 'Next Week' : 'This Week'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addSelectedDayButton}
              onPress={() => handleAddMeal(selectedDay)}
            >
              <MaterialIcons name="add" size={20} color={theme.COLORS.white} />
              <Text style={styles.addButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>

          {Object.keys(groupedSelectedDayMeals).length > 0 ? (
            Object.keys(groupedSelectedDayMeals).map(type => (
              <View key={type} style={styles.mealTypeSection}>
                <View style={styles.mealTypeLabelContainer}>
                  <MaterialIcons 
                    name={getMealTypeIcon(type)} 
                    size={20} 
                    color={theme.COLORS.primary} 
                  />
                  <Text style={styles.mealTypeTitleDark}>{getMealTypeLabel(type)}</Text>
                </View>
                {groupedSelectedDayMeals[type].map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    mealType={meal.type || 'other'}
                    onEdit={handleEditMeal}
                    onDelete={handleDeleteMeal}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={40} color={theme.COLORS.gray[400]} />
              <Text style={styles.emptyStateText}>No meals planned for {selectedDay}</Text>
              <Button
                title={`Add Meal for ${selectedDay}`}
                onPress={() => handleAddMeal(selectedDay)}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Meal Editor Modal */}
      {showEditor && (
        <MealEditor 
          onSave={handleSave} 
          onCancel={handleCancel}
          initialMeal={editMeal} 
          selectedDay={selectedDay}
          availableMealTypes={getAvailableMealTypes()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.SPACING.md,
    paddingBottom: theme.SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.SPACING.md,
    paddingVertical: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
    backgroundColor: theme.COLORS.white,
  },
  headerTitle: {
    fontSize: theme.FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  weekToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.gray[100],
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[200],
    ...theme.SHADOWS.small,
  },
  weekToggleText: {
    fontSize: theme.FONT_SIZES.sm,
    fontWeight: '600',
    color: theme.COLORS.primary,
    marginRight: theme.SPACING.xs,
  },
  todayCard: {
    marginTop: theme.SPACING.md,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...theme.SHADOWS.medium,
    padding: theme.SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.SPACING.md,
    paddingBottom: theme.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  todayTitleContainer: {
    flexDirection: 'column',
  },
  todayTitle: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.white,
  },
  todayDate: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.white,
    opacity: 0.8,
  },
  addTodayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    ...theme.SHADOWS.small,
  },
  todayMealsContainer: {
    marginTop: theme.SPACING.sm,
  },
  mealTypeSection: {
    marginBottom: theme.SPACING.md,
  },
  mealTypeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SPACING.xs,
  },
  mealTypeTitle: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.white,
    marginLeft: theme.SPACING.xs,
    opacity: 0.9,
  },
  mealTypeTitleDark: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.xs,
  },
  todayMealItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.BORDER_RADIUS.md,
    padding: theme.SPACING.md,
    marginBottom: theme.SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255,255,255,0.4)',
    ...theme.SHADOWS.small,
  },
  todayMealContent: {
    flex: 1,
  },
  todayMealText: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.white,
  },
  todayMealNotes: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.white,
    opacity: 0.8,
    marginTop: theme.SPACING.xs,
  },
  sectionTitle: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginTop: theme.SPACING.lg,
    marginBottom: theme.SPACING.sm,
  },
  selectedDayContainer: {
    marginBottom: theme.SPACING.xl,
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.lg,
    padding: theme.SPACING.md,
    ...theme.SHADOWS.small,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[200],
  },
  selectedDayHeader: {
    marginBottom: theme.SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  selectedDayTitleContainer: {
    flexDirection: 'column',
  },
  selectedDayTitle: {
    fontSize: theme.FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  selectedDaySubtitle: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
    marginTop: 2,
  },
  addSelectedDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary,
    paddingVertical: theme.SPACING.xs,
    paddingHorizontal: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.round,
    ...theme.SHADOWS.small,
  },
  addButtonText: {
    color: theme.COLORS.white,
    fontWeight: '600',
    marginLeft: theme.SPACING.xs,
    fontSize: theme.FONT_SIZES.sm,
  },
  mealTypeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SPACING.xs,
    marginTop: theme.SPACING.sm,
  },
  mealTypeTitleDark: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginLeft: theme.SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.SPACING.lg,
  },
  emptyStateText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[600],
    marginVertical: theme.SPACING.md,
    textAlign: 'center',
  },
  emptyStateTextWhite: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.white,
    marginVertical: theme.SPACING.md,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: theme.SPACING.sm,
  },
});

export default HomeScreen;