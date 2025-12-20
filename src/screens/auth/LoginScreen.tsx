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
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { getMyUserProfile } from '../../services/userService';

const LoginScreen = () => {
  const { login } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  useRoute<any>();
  const { alert } = useAppAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setSubmitting(true);
      const { emailVerified } = await login(email, password);

      if (!emailVerified) {
        alert(
          'Verify your account',
          'We sent a verification email. Please verify your email before logging in. Then return here and tap Sign In again (or use the “I’ve verified” button).',
        );
        return;
      }
      let isAdmin = false;
      try {
        const profile = await getMyUserProfile();
        isAdmin = profile?.role === 'admin';
      } catch {
        // ignore role lookup failures; default to user flow
      }

      if (isAdmin) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminTabs' }],
        });
        return;
      }

      // Always land on the main page (Home) after login, in one shot.
      // MainTabs has animation disabled in AppNavigator to avoid a second swipe/transition.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        }),
      );
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'An error occurred during login';

      if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials provided';
      }

      alert('Login Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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

        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.logoText, { color: colors.text }]}>S360</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Shop360°</Text>
        </View>

        <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome to Shop360°</Text>
        <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
          Sign in to your account
        </Text>

        <View style={styles.inputContainer}>
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
            />
          </View>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isPasswordFocused && { borderColor: colors.primary, borderWidth: 1.5 },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!submitting}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword', { email })}
            disabled={submitting}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.loginButtonText, { color: colors.background }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialLoginContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="logo-google" size={20} color={colors.textSecondary} />
            <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 32,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 20,
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
    marginBottom: 16,
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
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  loginButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '400',
  },
  socialLoginContainer: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    fontWeight: '400',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
