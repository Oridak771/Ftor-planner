import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Text, Platform, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen.js';
import RecipeScreen from './screens/RecipeScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';
import SplashScreen from './screens/SplashScreen.js';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import theme from './components/theme';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBow6oc2HgHkHewhMqo40jkj-Alm652qXM",
  authDomain: "ftorplanner.firebaseapp.com",
  projectId: "ftorplanner",
  storageBucket: "ftorplanner.firebasestorage.app",
  messagingSenderId: "996410349707",
  appId: "1:996410349707:web:e11aeb2f11c8a48e585c8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.log('Persistence error:', err.code);
});

const Tab = createBottomTabNavigator();

const TabIcon = ({ color, focused, name, label }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const bubbleSize = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      // Scale up the icon - using native driver
      Animated.spring(scaleValue, {
        toValue: 1.2,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Create bubble effect - using JS driver since we're animating width/height
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubbleSize, {
            toValue: 60,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(bubbleOpacity, {
            toValue: 0.2,
            duration: 250,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(() => {
        bubbleSize.setValue(0);
      });
    } else {
      // Scale down the icon - using native driver
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, scaleValue, bubbleSize, bubbleOpacity]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View 
        style={[
          styles.bubbleEffect,
          { 
            width: bubbleSize,
            height: bubbleSize,
            borderRadius: 30,
            backgroundColor: color,
            opacity: bubbleOpacity,
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.iconBackground, 
          { 
            backgroundColor: focused ? color : 'transparent',
            transform: [{ scale: scaleValue }] 
          }
        ]}
      >
        <MaterialIcons 
          name={name} 
          size={24} 
          color={focused ? theme.COLORS.white : color} 
        />
      </Animated.View>
      <Text style={[
        styles.tabLabel,
        { color: focused ? color : theme.COLORS.gray[500] }
      ]}>
        {label}
      </Text>
    </View>
  );
};

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

  // Get extra bottom padding for iOS devices with home indicator
  const getBottomTabBarHeight = () => {
    // Default height
    let height = 70;
    
    // Add extra padding for iOS devices with home indicator
    if (Platform.OS === 'ios') {
      // Check if device has a home indicator (iPhone X and newer)
      const isIphoneWithHomeIndicator = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((Platform.constants?.reactNativeVersion?.minor ?? 0) >= 50);
      
      if (isIphoneWithHomeIndicator) {
        height = 85; // Add extra padding for home indicator
      }
    }
    
    return height;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: theme.COLORS.white,
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: theme.COLORS.black,
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              height: getBottomTabBarHeight(),
              paddingBottom: Platform.OS === 'ios' ? 25 : 10,
              paddingTop: 5,
            },
            tabBarActiveTintColor: theme.COLORS.primary,
            tabBarInactiveTintColor: theme.COLORS.gray[500],
            tabBarShowLabel: false,
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon color={color} focused={focused} name="home" label="Home" />
              ),
            }}
          />
          <Tab.Screen
            name="Recipes"
            component={RecipeScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon color={color} focused={focused} name="restaurant-menu" label="Recipes" />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <TabIcon color={color} focused={focused} name="settings" label="Settings" />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    height: 55,
    position: 'relative',
    width: 80,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  bubbleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  }
});