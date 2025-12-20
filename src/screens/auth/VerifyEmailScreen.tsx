import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';

const VerifyEmailScreen = () => {
  const { colors } = useTheme();
  const { user, logout, refreshEmailVerification, resendVerificationEmail } = useAuth();
  const { alert } = useAppAlert();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const email = useMemo(() => user?.email ?? '', [user?.email]);
  // Intentionally no auto-alert on mount.
  // Verified users should never see a verification popup due to transient auth state.

  const onResend = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      alert('Verification sent', 'We sent a new verification email. Please check your inbox/spam.');
    } catch (e: any) {
      alert('Failed to resend', e?.message ?? 'Could not resend verification email. Try again later.');
    } finally {
      setResending(false);
    }
  };

  const onIHaveVerified = async () => {
    try {
      setChecking(true);
      const verified = await refreshEmailVerification();
      if (!verified) {
        alert(
          'Not verified yet',
          'We still can’t see a verified email on your account. Verify from your inbox, then tap again.',
        );
        return;
      }
      alert('Verified', 'Your email is verified. You can now use the app normally.');
    } catch (e: any) {
      alert('Error', e?.message ?? 'Could not refresh verification status. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } catch (e: any) {
      alert('Error', e?.message ?? 'Could not log out.');
    }
  };

  return (
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
        <View style={[styles.iconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent a verification email{email ? ` to ${email}` : ''}. Verify it, then tap “I’ve verified”.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onIHaveVerified}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>I’ve verified</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={onResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Resend email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: 'transparent', borderColor: colors.border },
          ]}
          onPress={onLogout}
          disabled={checking || resending}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            Log out (continue as guest)
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : (StatusBar.currentHeight ?? 0) + 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  actions: {
    paddingBottom: 26,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default VerifyEmailScreen;


