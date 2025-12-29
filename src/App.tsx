import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ViroTelemetry } from '@viro-community/react-viro';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppAlertProvider } from './contexts/AppAlertContext';
import { useTheme } from './contexts/ThemeContext';
import { FontSizeProvider } from './contexts/FontSizeContext';

// Configure Google Sign-In as early as possible (before any auth screen interaction).
GoogleSignin.configure({
  webClientId: '294453693408-5j2vttrgnm7tk5dhe8ai9j74uco85b4l.apps.googleusercontent.com',
});

// Viro sends anonymous telemetry with an AbortController timeout; in RN dev mode the abort can surface
// as a noisy redbox ("Aborted" from whatwg-fetch). Opt out to keep logs clean.
ViroTelemetry.optOutTelemetry();

const ThemedStatusBar = () => {
  const { colors, isDark } = useTheme();
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={colors.background}
      translucent={false}
    />
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <FontSizeProvider>
            <AppAlertProvider>
              <ThemedStatusBar />
              <AppNavigator />
            </AppAlertProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
