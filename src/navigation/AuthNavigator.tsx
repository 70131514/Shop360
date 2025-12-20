import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AuthNavigator = () => (
  <View style={styles.container}>
    <Text>Auth</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthNavigator;
