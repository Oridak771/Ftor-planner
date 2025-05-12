import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  I18nManager,
  ActivityIndicator // Import ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../components/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { t, getCurrentLang, getLangs, setLanguage, loadTranslations } from '../locales/i18n';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage } from '../components/LanguageContext';

const SettingsScreen = () => {
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [weekStartsOn, setWeekStartsOn] = useState('monday');
  const [mealTypes, setMealTypes] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  });
  const [language, setLangState] = useState(getCurrentLang());
  const { currentLanguage, setLanguage: setAppLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false); // Add loading state

  const languageOptions = [
    { code: 'en', name: 'English', icon: '🇬🇧' },
    { code: 'fr', name: 'Français', icon: '🇫🇷' },
    { code: 'ar', name: 'العربية', icon: '🇸🇦' }
  ];

  useEffect(() => {
    loadSettings();
    loadTranslations();
  }, []);

  const loadSettings = async () => {
    try {
      const vegetarianSetting = await AsyncStorage.getItem('isVegetarian');
      if (vegetarianSetting !== null) {
        setIsVegetarian(vegetarianSetting === 'true');
      }
      
      const darkModeSetting = await AsyncStorage.getItem('isDarkMode');
      if (darkModeSetting !== null) {
        setIsDarkMode(darkModeSetting === 'true');
      }
      
      const notificationsSetting = await AsyncStorage.getItem('notificationsEnabled');
      if (notificationsSetting !== null) {
        setNotificationsEnabled(notificationsSetting === 'true');
      }
      
      const remindersSetting = await AsyncStorage.getItem('mealReminders');
      if (remindersSetting !== null) {
        setMealReminders(remindersSetting === 'true');
      }
      
      const weekStartSetting = await AsyncStorage.getItem('weekStartsOn');
      if (weekStartSetting !== null) {
        setWeekStartsOn(weekStartSetting);
      }
      
      const mealTypesSetting = await AsyncStorage.getItem('mealTypes');
      if (mealTypesSetting !== null) {
        setMealTypes(JSON.parse(mealTypesSetting));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      if (typeof value === 'object') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, value.toString());
      }
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const toggleVegetarian = async (value) => {
    setIsVegetarian(value);
    saveSetting('isVegetarian', value);
  };

  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    saveSetting('isDarkMode', value);
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    saveSetting('notificationsEnabled', value);
    
    if (!value) {
      setMealReminders(false);
      saveSetting('mealReminders', false);
    }
  };

  const toggleMealReminders = async (value) => {
    setMealReminders(value);
    saveSetting('mealReminders', value);
  };

  const setWeekStart = async (day) => {
    setWeekStartsOn(day);
    saveSetting('weekStartsOn', day);
  };
  
  const toggleMealType = async (type, value) => {
    // Ensure at least one meal type is enabled
    const updatedMealTypes = { ...mealTypes, [type]: value };
    const hasEnabledType = Object.values(updatedMealTypes).some(enabled => enabled);
    
    if (!hasEnabledType) {
      Alert.alert('Error', 'At least one meal type must be enabled.');
      return;
    }
    
    setMealTypes(updatedMealTypes);
    saveSetting('mealTypes', updatedMealTypes);
  };

  const backupKeys = [
    'meals', 'recipes', 'shoppingList', 'mealTypes', 'isVegetarian', 'isDarkMode', 'notificationsEnabled', 'mealReminders', 'weekStartsOn', 'language'
  ];

  const handleExportData = async () => {
    try {
      const backup = {};
      for (const key of backupKeys) {
        const value = await AsyncStorage.getItem(key);
        backup[key] = value;
      }
      const fileUri = FileSystem.documentDirectory + 'ftorplanner-backup.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2));
      await Sharing.shareAsync(fileUri);
      Alert.alert('Export Successful', 'Your data has been exported successfully.');
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const handleImportData = async () => {
    try {
      // In a real app, use a file picker. Here, just look for the backup file in documentDirectory.
      const fileUri = FileSystem.documentDirectory + 'ftorplanner-backup.json';
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backup = JSON.parse(content);
      for (const key of backupKeys) {
        if (backup[key] !== undefined) {
          await AsyncStorage.setItem(key, backup[key]);
        }
      }
      Alert.alert('Import Successful', 'Your data has been imported successfully.');
    } catch (e) {
      Alert.alert('Import Failed', 'Could not import data.');
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data using the backup keys
              for (const key of backupKeys) {
                await AsyncStorage.removeItem(key);
              }
              // Reset all states to default
              setIsVegetarian(false);
              setIsDarkMode(false);
              setNotificationsEnabled(true);
              setMealReminders(true);
              setWeekStartsOn('monday');
              setMealTypes({
                breakfast: true,
                lunch: true,
                dinner: true,
                snack: true
              });
              Alert.alert('Success', 'All data has been cleared successfully.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleLanguageChange = async (langCode) => {
    if (isChangingLanguage) return; // Prevent double taps

    setIsChangingLanguage(true);
    try {
      const result = await setAppLanguage(langCode);

      if (result === true) {
        setShowLanguageModal(false);
      } else if (result === false) {
        Alert.alert(t('error'), t('languageChangeError'));
        setShowLanguageModal(false);
      }
    } catch (error) {
      console.error('Error changing language in SettingsScreen:', error);
      Alert.alert(t('error'), t('languageChangeError'));
      setShowLanguageModal(false);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const renderSettingSwitch = (title, value, onToggle, description = null, disabled = false) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.COLORS.gray[300], true: theme.COLORS.primary }}
        thumbColor={Platform.OS === 'ios' ? undefined : value ? theme.COLORS.white : theme.COLORS.gray[100]}
        disabled={disabled}
      />
    </View>
  );
  
  const renderMealTypeSwitch = (type, label, icon) => (
    <View style={styles.mealTypeItem}>
      <View style={styles.mealTypeIconContainer}>
        <MaterialIcons name={icon} size={24} color={mealTypes[type] ? theme.COLORS.primary : theme.COLORS.gray[400]} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={mealTypes[type]}
        onValueChange={(value) => toggleMealType(type, value)}
        trackColor={{ false: theme.COLORS.gray[300], true: theme.COLORS.primary }}
        thumbColor={Platform.OS === 'ios' ? undefined : mealTypes[type] ? theme.COLORS.white : theme.COLORS.gray[100]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {renderSettingSwitch(
            'Vegetarian Mode',
            isVegetarian,
            toggleVegetarian,
            'Only show vegetarian recipes'
          )}
          
          {renderSettingSwitch(
            'Dark Mode',
            isDarkMode,
            toggleDarkMode,
            'Use dark theme throughout the app'
          )}
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Types</Text>
          <Text style={styles.settingDescription}>Select which meal types to display in your planner</Text>
          
          {renderMealTypeSwitch('breakfast', 'Breakfast', 'free-breakfast')}
          {renderMealTypeSwitch('lunch', 'Lunch', 'restaurant')}
          {renderMealTypeSwitch('dinner', 'Dinner', 'dinner-dining')}
          {renderMealTypeSwitch('snack', 'Snacks', 'icecream')}
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingSwitch(
            'Enable Notifications',
            notificationsEnabled,
            toggleNotifications,
            'Receive app notifications'
          )}
          
          {renderSettingSwitch(
            'Meal Reminders',
            mealReminders,
            toggleMealReminders,
            'Get reminders for planned meals',
            !notificationsEnabled
          )}
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar</Text>
          <Text style={styles.settingLabel}>Week Starts On</Text>
          
          <View style={styles.weekDayContainer}>
            {[
              { id: 'monday', label: 'Monday' },
              { id: 'sunday', label: 'Sunday' },
            ].map(day => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.weekDayButton,
                  weekStartsOn === day.id && styles.selectedWeekDay
                ]}
                onPress={() => setWeekStart(day.id)}
              >
                <Text 
                  style={[
                    styles.weekDayText,
                    weekStartsOn === day.id && styles.selectedWeekDayText
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingRow}>
              <MaterialIcons name="language" size={24} color={theme.COLORS.primary} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('language')}</Text>
                <Text style={styles.settingValue}>
                  {languageOptions.find(lang => lang.code === currentLanguage)?.name}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={theme.COLORS.gray[400]}
                style={I18nManager.isRTL && { transform: [{ scaleX: -1 }] }}
              />
            </View>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.dataButtonsContainer}>
            <Button
              title="Export Data"
              variant="outline"
              onPress={handleExportData}
              style={styles.dataButton}
              size="small"
            />
            
            <Button
              title="Import Data"
              variant="outline"
              onPress={handleImportData}
              style={styles.dataButton}
              size="small"
            />
          </View>
          
          <Button
            title="Clear All Data"
            variant="danger"
            onPress={handleClearData}
            style={styles.clearDataButton}
          />
        </Card>
        
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Developer</Text>
            <Text style={styles.aboutValue}>Ftor Planner Team</Text>
          </View>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.COLORS.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.COLORS.gray[600]} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <Card style={styles.languageModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity 
                onPress={() => !isChangingLanguage && setShowLanguageModal(false)} // Disable close while changing
                style={styles.closeButton}
                disabled={isChangingLanguage}
              >
                <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>
            </View>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  currentLanguage === lang.code && styles.selectedLanguage,
                  isChangingLanguage && styles.disabledOption // Style disabled options
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                disabled={isChangingLanguage || currentLanguage === lang.code}
              >
                <Text style={styles.languageIcon}>{lang.icon}</Text>
                <Text style={[
                  styles.languageText,
                  currentLanguage === lang.code && styles.selectedLanguageText
                ]}>
                  {lang.name}
                </Text>
                {isChangingLanguage && currentLanguage !== lang.code ? (
                  <ActivityIndicator size="small" color={theme.COLORS.primary} style={styles.checkIcon} />
                ) : currentLanguage === lang.code ? (
                  <MaterialIcons 
                    name="check" 
                    size={20} 
                    color={theme.COLORS.primary}
                    style={styles.checkIcon} 
                  />
                ) : (
                  <View style={styles.checkIconPlaceholder} /> // Keep spacing consistent
                )}
              </TouchableOpacity>
            ))}
          </Card>
        </View>
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
  section: {
    marginBottom: theme.SPACING.md,
  },
  sectionTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: theme.SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  mealTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  mealTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SPACING.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: theme.SPACING.md,
  },
  settingLabel: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
  },
  weekDayContainer: {
    flexDirection: 'row',
    marginTop: theme.SPACING.sm,
  },
  weekDayButton: {
    paddingVertical: theme.SPACING.sm,
    paddingHorizontal: theme.SPACING.md,
    borderRadius: theme.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: theme.COLORS.gray[300],
    marginRight: theme.SPACING.sm,
  },
  selectedWeekDay: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
  },
  weekDayText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
  },
  selectedWeekDayText: {
    color: theme.COLORS.white,
  },
  dataButtonsContainer: {
    flexDirection: 'row',
    marginBottom: theme.SPACING.md,
  },
  dataButton: {
    flex: 1,
    marginRight: theme.SPACING.sm,
  },
  clearDataButton: {
    marginTop: theme.SPACING.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  aboutLabel: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
  },
  aboutValue: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.gray[600],
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  linkText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SPACING.lg,
  },
  languageModal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.BORDER_RADIUS.lg,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  modalTitle: {
    fontSize: theme.FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  closeButton: {
    padding: theme.SPACING.xs,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  disabledOption: {
    opacity: 0.6, // Dim the option when changing language
  },
  selectedLanguage: {
    backgroundColor: theme.COLORS.gray[100],
  },
  languageIcon: {
    fontSize: theme.FONT_SIZES.xl,
    marginRight: theme.SPACING.sm,
  },
  languageText: {
    fontSize: theme.FONT_SIZES.md,
    color: theme.COLORS.text,
    flex: 1,
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: theme.COLORS.primary,
  },
  checkIcon: {
    marginLeft: theme.SPACING.md,
    width: 20, // Ensure consistent width
    height: 20, // Ensure consistent height
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconPlaceholder: {
    marginLeft: theme.SPACING.md,
    width: 20,
    height: 20,
  },
  languageSelector: {
    paddingVertical: theme.SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.gray[200],
  },
  settingTitle: {
    fontSize: theme.FONT_SIZES.md,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: theme.FONT_SIZES.sm,
    color: theme.COLORS.gray[600],
  }
});

export default SettingsScreen;