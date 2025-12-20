import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';

const ChangeEmailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, updateEmail } = useAuth();
  const { alert } = useAppAlert();

  const currentEmail = useMemo(() => user?.email ?? '', [user?.email]);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    const email = String(newEmail ?? '').trim();
    if (!email) {
      alert('Error', 'Please enter a new email address.');
      return;
    }
    if (!currentPassword) {
      alert('Error', 'Please enter your current password.');
      return;
    }

    alert(
      'Change email?',
      'You’ll be signed out and must verify the new email, then log in again with the same password.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              setSubmitting(true);
              await updateEmail(email, currentPassword);
              alert(
                'Email updated',
                'We sent a verification email to your new address. Please verify it, then log in again.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
              );
            } catch (e: any) {
              let msg = e?.message ?? 'Could not update email. Please try again.';
              if (e?.code === 'auth/invalid-email') {
                msg = 'That email address is invalid.';
              } else if (e?.code === 'auth/email-already-in-use') {
                msg = 'That email address is already in use.';
              } else if (e?.code === 'auth/wrong-password') {
                msg = 'Your current password is incorrect.';
              } else if (e?.code === 'auth/requires-recent-login') {
                msg = 'Please log in again and retry changing your email.';
              }
              alert('Change email failed', msg);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={false}
        />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Change email</Text>
          {!!currentEmail && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Current: {currentEmail}
            </Text>
          )}
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>New email</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Current password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!submitting}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} disabled={submitting}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textSecondary}
                style={{ padding: 8 }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>Update email</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight ?? 0) + 10,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  primaryButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ChangeEmailScreen;


