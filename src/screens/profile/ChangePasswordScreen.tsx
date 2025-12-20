import React, { useState } from 'react';
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

const ChangePasswordScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { updatePassword } = useAuth();
  const { alert } = useAppAlert();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async () => {
    if (!currentPassword) {
      alert('Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword) {
      alert('Error', 'Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(currentPassword, newPassword);
      alert('Password updated', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      let msg = e?.message ?? 'Could not update password. Please try again.';
      if (e?.code === 'auth/wrong-password') {
        msg = 'Your current password is incorrect.';
      } else if (e?.code === 'auth/weak-password') {
        msg = 'Your new password is too weak.';
      } else if (e?.code === 'auth/requires-recent-login') {
        msg = 'Please log in again and retry changing your password.';
      }
      alert('Change password failed', msg);
    } finally {
      setSubmitting(false);
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Change password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Use your current password to confirm this change.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Current password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
              editable={!submitting}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} disabled={submitting}>
              <Ionicons
                name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textSecondary}
                style={{ padding: 8 }}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>New password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="key-outline" size={18} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showNew}
              autoCapitalize="none"
              editable={!submitting}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowNew((v) => !v)} disabled={submitting}>
              <Ionicons
                name={showNew ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textSecondary}
                style={{ padding: 8 }}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm new password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="key-outline" size={18} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              editable={!submitting}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} disabled={submitting}>
              <Ionicons
                name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
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
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                Update password
              </Text>
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
    lineHeight: 18,
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

export default ChangePasswordScreen;


