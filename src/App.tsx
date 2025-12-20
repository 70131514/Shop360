import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppAlertProvider } from './contexts/AppAlertContext';
import { useTheme } from './contexts/ThemeContext';

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
          <AppAlertProvider>
            <ThemedStatusBar />
            <AppNavigator />
          </AppAlertProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
