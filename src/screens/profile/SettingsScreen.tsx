import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  Linking,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { useFontSize } from '../../contexts/FontSizeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  storeNotificationPreferences,
  getNotificationPreferences,
  clearAllStorage,
} from '../../utils/storage';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const { preset, setPreset } = useFontSize();
  const { user, linkGoogleAccount } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);

  const [isClearing, setIsClearing] = useState(false);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);

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

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Shop360 needs access to your location to provide location-based features like address autofill and delivery tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return result;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const persistLocation = async (next: boolean) => {
    if (next) {
      // Request permission when enabling
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          alert(
            'Permission Required',
            'Location permission is required to use location services. You can enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setLocationEnabled(false) },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'android') {
                    Linking.openSettings();
                  }
                },
              },
            ],
          );
          return;
        }
      }
    }

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

  const handleLinkGoogle = () => {
    if (!user) {
      alert('Sign in required', 'Please sign in to link your Google account.');
      return;
    }
    alert(
      'Link Google account',
      'This will link Google Sign-In to your existing account (must use the same email).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Link',
          onPress: async () => {
            try {
              await linkGoogleAccount();
              alert('Success', 'Google account linked successfully.');
            } catch (e: any) {
              const msg = e?.message ?? 'Failed to link Google account.';
              alert('Error', msg);
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

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setFontPickerOpen(true)}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="text-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Font size</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                {preset === 'xs'
                  ? 'Extra small'
                  : preset === 's'
                  ? 'Small'
                  : preset === 'm'
                  ? 'Medium'
                  : preset === 'l'
                  ? 'Large'
                  : 'Extra large'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

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

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleLinkGoogle}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="logo-google" size={20} color={colors.text} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Link Google account</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                Add Google Sign-In to your existing account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

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

      <Modal
        visible={fontPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFontPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFontPickerOpen(false)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Font size</Text>
              <TouchableOpacity onPress={() => setFontPickerOpen(false)} activeOpacity={0.8}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {(
              [
                { key: 'xs', label: 'Extra small' },
                { key: 's', label: 'Small' },
                { key: 'm', label: 'Medium (default)' },
                { key: 'l', label: 'Large' },
                { key: 'xl', label: 'Extra large' },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.85}
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={async () => {
                  await setPreset(opt.key);
                  setFontPickerOpen(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{opt.label}</Text>
                <Ionicons
                  name={preset === opt.key ? 'checkmark' : 'chevron-forward'}
                  size={18}
                  color={preset === opt.key ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}

            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
              This works together with your phone’s accessibility font size settings.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalOption: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalHint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default SettingsScreen;
