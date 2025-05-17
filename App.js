import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import RecipeScreen from './screens/RecipeScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import IngredientSuggestScreen from './screens/IngredientSuggestScreen';
import SettingsScreen from './screens/SettingsScreen';
import SplashScreen from './screens/SplashScreen';

import theme from './components/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { t } from './locales/i18n';
import { LanguageProvider, useLanguage } from './components/LanguageContext';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { currentLanguage, isRTL } = useLanguage(); // isContextLoading is not used here as LanguageProvider handles its own loading UI

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = 'calendar-today';
              else if (route.name === 'Recipes') iconName = 'menu-book';
              else if (route.name === 'Shopping') iconName = 'shopping-cart';
              else if (route.name === 'Suggest') iconName = 'lightbulb';
              else if (route.name === 'Settings') iconName = 'settings';
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.COLORS.primary,
            tabBarInactiveTintColor: theme.COLORS.gray[400],
            headerStyle: {
              backgroundColor: theme.COLORS.white,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.COLORS.gray[200],
            },
            headerTitleStyle: {
              fontSize: theme.FONT_SIZES.xxl,
              fontWeight: 'bold',
              color: theme.COLORS.text,
              textAlign: isRTL ? 'right' : 'left',
            }
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: t('mealPlanner') }}
          />
          <Tab.Screen
            name="Recipes"
            component={RecipeScreen}
            options={{ title: t('recipes') }}
          />
          <Tab.Screen
            name="Shopping"
            component={ShoppingListScreen}
            options={{ title: t('shoppingList') }}
          />
          <Tab.Screen
            name="Suggest"
            component={IngredientSuggestScreen}
            options={{ title: t('ingredientSuggestions') }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('settings') }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        {showSplash ? (
          <SplashScreen onAnimationFinish={handleSplashFinish} />
        ) : (
          <AppContent />
        )}
      </LanguageProvider>
    </SafeAreaProvider>
  );
}