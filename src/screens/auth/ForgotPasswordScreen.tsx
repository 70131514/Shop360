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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';

type ForgotPasswordRouteParams =
  | {
      email?: string;
    }
  | undefined;

const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const { resetPassword } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialEmail = useMemo(() => {
    const params = (route.params ?? {}) as ForgotPasswordRouteParams;
    return String(params?.email ?? '').trim();
  }, [route.params]);

  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const handleSend = async () => {
    const trimmed = String(email ?? '').trim();
    if (!trimmed) {
      alert('Error', 'Please enter your email address.');
      return;
    }
    try {
      setSubmitting(true);
      await resetPassword(trimmed);
      alert(
        'Reset email sent',
        'If an account exists for this email, we sent a password reset link. Check your inbox/spam.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (e: any) {
      let msg = e?.message ?? 'Could not send password reset email. Please try again.';
      if (e?.code === 'auth/invalid-email') {
        msg = 'That email address is invalid.';
      } else if (e?.code === 'auth/user-not-found') {
        // Keep message generic for privacy, but treat it as success UX-wise
        msg = 'If an account exists for this email, we sent a password reset link.';
      }
      alert('Reset failed', msg);
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email and we’ll send you a password reset link.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isEmailFocused && { borderColor: colors.primary, borderWidth: 1.5 },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                Send reset email
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 20,
  },
  header: {
    marginBottom: 28,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: 14,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.3,
    height: '100%',
  },
  primaryButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default ForgotPasswordScreen;


