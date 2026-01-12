import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateMyName } from '../../services/userService';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { useAvatarSourceForUser } from '../../hooks/useAvatarSource';
import { getAvatarSourceForUser } from '../../utils/avatarUtils';

const PersonalInfoScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, profile } = useAuth();
  const { alert } = useAppAlert();
  const isGuest = !user;
  const isAdmin = profile?.role === 'admin';

  // Load avatar source
  const avatarSource =
    useAvatarSourceForUser({
      avatarId: profile?.avatarId,
      isGuest,
      isAdmin,
    }) ||
    getAvatarSourceForUser({
      avatarId: profile?.avatarId,
      isGuest,
      isAdmin,
    });

  const initialEmail = useMemo(
    () => (profile?.email || user?.email) ?? '',
    [profile?.email, user?.email],
  );
  const initialName = useMemo(
    () => (profile?.name || user?.displayName) ?? '',
    [profile?.name, user?.displayName],
  );

  const [name, setName] = useState(initialName);
  const [email] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const lastProfileNameRef = useRef<string>(initialName);
  const userHasEditedRef = useRef<boolean>(false);

  // Initialize from profile when available and update in real-time
  useEffect(() => {
    const profileName = profile?.name || user?.displayName || '';
    if (profileName && profileName !== lastProfileNameRef.current) {
      // Only update if user hasn't manually edited
      if (!userHasEditedRef.current) {
        setName(profileName);
        lastProfileNameRef.current = profileName;
      } else {
        // Profile changed externally, but user has edits - update the ref but don't overwrite user's input
        lastProfileNameRef.current = profileName;
      }
    }
  }, [profile?.name, user?.displayName]);

  // Track when user manually edits the name
  const handleNameChange = (newName: string) => {
    userHasEditedRef.current = true;
    setName(newName);
  };

  // Reset edit flag after successful save
  const handleSaveSuccess = () => {
    userHasEditedRef.current = false;
    lastProfileNameRef.current = name;
  };

  const handleSave = async () => {
    try {
      if (saving) {
        return;
      }
      setSaving(true);
      await updateMyName(name);
      handleSaveSuccess();
      alert('Saved', 'Your name has been updated.');
      navigation.goBack();
    } catch (e: any) {
      alert('Could not save', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AvatarPicker')}
              activeOpacity={0.8}
              style={[styles.avatarContainer, { borderColor: colors.border }]}
            >
              <Image source={avatarSource} style={styles.avatarImage} />
            </TouchableOpacity>
            <Text style={[styles.avatarLabel, { color: colors.textSecondary }]}>Avatar</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AvatarPicker')}
              activeOpacity={0.7}
              style={styles.avatarChangeButton}
            >
              <Text style={[styles.avatarChangeText, { color: colors.primary }]}>
                Change Avatar
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                styles.readOnlyInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.textSecondary,
                  borderColor: colors.border,
                },
              ]}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
            <View style={styles.helperContainer}>
              <Text style={[styles.helper, { color: colors.textSecondary }]}>
                Email can't be changed here.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
                style={styles.settingsLink}
              >
                <Ionicons name="settings-outline" size={14} color={colors.primary} />
                <Text style={[styles.settingsLinkText, { color: colors.primary }]}>
                  Change email in Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  opacity: saving ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Text style={[styles.saveButtonText, { color: colors.background }]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  helperContainer: {
    marginTop: 8,
    gap: 8,
  },
  helper: {
    fontSize: 12,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  settingsLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  readOnlyInput: {
    opacity: 0.85,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  avatarChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  avatarChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PersonalInfoScreen;
