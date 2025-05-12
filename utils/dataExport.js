import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const EXPORTABLE_KEYS = [
  'meals',
  'recipes',
  'shoppingList',
  'savedIngredients',
  'userLanguage'
];

export const exportData = async () => {
  try {
    const data = {};
    for (const key of EXPORTABLE_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
      }
    }

    const exportDate = new Date().toISOString();
    const exportData = {
      version: '1.0',
      exportDate,
      data
    };

    const fileName = `ftorplanner_backup_${exportDate.split('T')[0]}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export FtorPlanner Data',
        UTI: 'public.json'
      });
    }

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (fileUri) => {
  try {
    const content = await FileSystem.readAsStringAsync(fileUri);
    const importedData = JSON.parse(content);

    if (!importedData.version || !importedData.data) {
      throw new Error('Invalid backup file format');
    }

    // Clear existing data
    await AsyncStorage.multiRemove(EXPORTABLE_KEYS);

    // Import new data
    for (const [key, value] of Object.entries(importedData.data)) {
      if (EXPORTABLE_KEYS.includes(key)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export const validateBackupFile = async (fileUri) => {
  try {
    const content = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(content);
    
    return (
      data.version &&
      data.exportDate &&
      data.data &&
      typeof data.data === 'object'
    );
  } catch {
    return false;
  }
};