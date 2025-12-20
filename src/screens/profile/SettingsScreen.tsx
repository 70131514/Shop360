import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import {
  storeNotificationPreferences,
  getNotificationPreferences,
  clearAllStorage,
} from '../../utils/storage';

type SettingItem = {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'select' | 'action';
  value: boolean;
  icon: string;
};

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'change-email',
      title: 'Change Email',
      description: 'Update your login email (requires verification)',
      type: 'action',
      value: false,
      icon: 'mail-outline',
    },
    {
      id: 'change-password',
      title: 'Change Password',
      description: 'Update your account password',
      type: 'action',
      value: false,
      icon: 'key-outline',
    },
    {
      id: '1',
      title: 'Dark Mode',
      description: 'Enable dark theme for the app',
      type: 'toggle',
      value: isDark,
      icon: 'moon-outline',
    },
    {
      id: '2',
      title: 'Location Services',
      description: 'Allow app to access your location',
      type: 'toggle',
      value: true,
      icon: 'location-outline',
    },
    {
      id: '3',
      title: 'Clear Cache',
      description: 'Free up storage space',
      type: 'action',
      value: false,
      icon: 'trash-outline',
    },
    {
      id: '4',
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      type: 'action',
      value: false,
      icon: 'shield-checkmark-outline',
    },
    {
      id: '5',
      title: 'Terms of Service',
      description: 'Read our terms of service',
      type: 'action',
      value: false,
      icon: 'document-text-outline',
    },
  ]);

  const [isClearing, setIsClearing] = useState(false);

  // Load saved notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const savedPreferences = await getNotificationPreferences();
      if (savedPreferences) {
        setSettings((prevSettings) =>
          prevSettings.map((setting) => ({
            ...setting,
            value: savedPreferences[setting.id] ?? setting.value,
          })),
        );
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = async (id: string) => {
    if (id === '1') {
      // Handle theme toggle
      toggleTheme();
      setSettings(
        settings.map((setting) =>
          setting.id === id ? { ...setting, value: !setting.value } : setting,
        ),
      );
    } else {
      // Handle other toggles
      const newSettings = settings.map((setting) =>
        setting.id === id ? { ...setting, value: !setting.value } : setting,
      );
      setSettings(newSettings);

      // Save notification preferences
      const preferences = newSettings.reduce((acc, setting) => {
        if (setting.type === 'toggle') {
          acc[setting.id] = setting.value;
        }
        return acc;
      }, {} as Record<string, boolean>);
      await storeNotificationPreferences(preferences);
    }
  };

  const handleAction = (id: string) => {
    // Handle different actions based on setting id
    switch (id) {
      case 'change-email':
        navigation.navigate('ChangeEmail');
        break;
      case 'change-password':
        navigation.navigate('ChangePassword');
        break;
      case '6':
        // Clear cache logic
        alert(
          'Clear Cache',
          'Are you sure you want to clear all app data? This will remove your wishlist, cart, and other saved preferences.',
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
                  setIsClearing(true);
                  await clearAllStorage();
                  // Reset settings to default values
                  setSettings((prevSettings) =>
                    prevSettings.map((setting) => ({
                      ...setting,
                      value: setting.id === '1' ? isDark : false,
                    })),
                  );
                  alert('Success', 'Cache cleared successfully');
                } catch (error) {
                  console.error('Clear cache error:', error);
                  alert('Error', 'Failed to clear cache. Please try again.');
                } finally {
                  setIsClearing(false);
                }
              },
            },
          ],
        );
        break;
      case '7':
        // Open privacy policy
        break;
      case '8':
        // Open terms of service
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {settings.map((setting) => (
          <TouchableOpacity
            key={setting.id}
            activeOpacity={0.85}
            style={[styles.settingItem, { backgroundColor: colors.surface }]}
            onPress={() => {
              if (setting.type === 'toggle') {
                handleToggle(setting.id);
                return;
              }
              if (setting.type === 'action') {
                handleAction(setting.id);
                return;
              }
              // select
              handleAction(setting.id);
            }}
            disabled={isClearing && setting.id === '6'}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={setting.icon} size={20} color={colors.text} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {setting.description}
                </Text>
              </View>
            </View>

            {setting.type === 'toggle' && (
              <Switch
                value={setting.value}
                onValueChange={() => handleToggle(setting.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
              />
            )}

            {setting.type === 'select' && (
              <View style={styles.selectButton}>
                <Text style={[styles.selectButtonText, { color: colors.primary }]}>Select</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            )}

            {setting.type === 'action' && (
              <View style={styles.actionButton}>
                {isClearing && setting.id === '6' ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  actionButton: {
    padding: 8,
  },
});

export default SettingsScreen;
