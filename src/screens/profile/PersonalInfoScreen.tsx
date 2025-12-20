import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getMyUserProfile, updateMyName } from '../../services/userService';
import { useAppAlert } from '../../contexts/AppAlertContext';

const PersonalInfoScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { alert } = useAppAlert();

  const initialEmail = useMemo(() => user?.email ?? '', [user?.email]);
  const initialName = useMemo(() => user?.displayName ?? '', [user?.displayName]);

  const [name, setName] = useState(initialName);
  const [email] = useState(initialEmail);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const profile = await getMyUserProfile();
        if (!alive) {
          return;
        }
        setName(profile?.name ?? initialName);
      } catch {
        // fallback to Auth displayName
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [initialName]);

  const handleSave = async () => {
    try {
      if (saving) {
        return;
      }
      setSaving(true);
      await updateMyName(name);
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
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.pageTitle, { color: colors.text }]}>Personal Information</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading profile…
              </Text>
            </View>
          ) : (
            <>
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
                  onChangeText={setName}
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
                <Text style={[styles.helper, { color: colors.textSecondary }]}>
                  Email can’t be changed here.
                </Text>
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
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    width: '80%',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
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
});

export default PersonalInfoScreen;
