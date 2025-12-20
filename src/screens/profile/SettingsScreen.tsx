import React, { useEffect, useState } from 'react';
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

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);

  const [isClearing, setIsClearing] = useState(false);

  // Load saved preferences (best-effort)
  useEffect(() => {
    const loadPreferences = async () => {
      const savedPreferences = await getNotificationPreferences();
      if (savedPreferences) {
        setLocationEnabled(savedPreferences.locationServices ?? true);
      }
    };
    loadPreferences();
  }, []);

  const persistLocation = async (next: boolean) => {
    setLocationEnabled(next);
    try {
      await storeNotificationPreferences({ locationServices: next });
    } catch {
      // ignore
    }
  };

  const handleClearCache = () => {
    alert(
      'Clear Cache',
      'Are you sure you want to clear all app data? This will remove your wishlist, cart, and other saved preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearAllStorage();
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
        <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>

        {/* Theme (top) */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <View
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="moon-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Enable dark theme for the app
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => toggleTheme()}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Account cards */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
        <View style={styles.cardRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.actionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('ChangeEmail')}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="mail-outline" size={20} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Change Email</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Update your login email (verification required)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.actionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="key-outline" size={20} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Change Password</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Keep your account secure
            </Text>
          </TouchableOpacity>
        </View>

        {/* Remaining options */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>

        <View
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="location-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Location Services</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Allow app to access your location
              </Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={(v) => persistLocation(v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleClearCache}
          disabled={isClearing}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="trash-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Clear Cache</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Free up storage space
              </Text>
            </View>
          </View>
          {isClearing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => alert('Coming soon', 'Privacy Policy will be available here.')}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Privacy Policy</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Read our privacy policy
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => alert('Coming soon', 'Terms of Service will be available here.')}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Terms of Service</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Read our terms of service
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
    paddingBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 14,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 140,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
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
