import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

type Props = {
  label?: string;
};

const AuthLoadingOverlay = ({ label = 'Signing you in…' }: Props) => {
  const { colors } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle2Scale = useRef(new Animated.Value(1)).current;
  const circle3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();

    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration, useNativeDriver: true }),
        ]),
      );

    const createScaleAnimation = (animValue: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, { toValue: 1.2, duration, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 1, duration, useNativeDriver: true }),
        ]),
      );

    const float1 = createFloatingAnimation(circle1, 3000, 0);
    const float2 = createFloatingAnimation(circle2, 4000, 500);
    const float3 = createFloatingAnimation(circle3, 3500, 1000);
    const scale1 = createScaleAnimation(circle1Scale, 2000, 0);
    const scale2 = createScaleAnimation(circle2Scale, 2500, 300);
    const scale3 = createScaleAnimation(circle3Scale, 2200, 600);

    float1.start();
    float2.start();
    float3.start();
    scale1.start();
    scale2.start();
    scale3.start();

    return () => {
      float1.stop();
      float2.stop();
      float3.stop();
      scale1.stop();
      scale2.stop();
      scale3.stop();
    };
  }, [circle1, circle1Scale, circle2, circle2Scale, circle3, circle3Scale, fade]);

  const circle1TranslateY = circle1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const circle2TranslateY = circle2.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
  const circle3TranslateY = circle3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.bg}>
          <Animated.View
            style={[
              styles.circle,
              styles.circle1,
              {
                backgroundColor: colors.primary,
                opacity: 0.08,
                transform: [{ translateY: circle1TranslateY }, { scale: circle1Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle2,
              {
                backgroundColor: colors.primary,
                opacity: 0.06,
                transform: [{ translateY: circle2TranslateY }, { scale: circle2Scale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              styles.circle3,
              {
                backgroundColor: colors.primary,
                opacity: 0.1,
                transform: [{ translateY: circle3TranslateY }, { scale: circle3Scale }],
              },
            ]}
          />
        </View>

        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg: {
    position: 'absolute',
    width,
    height,
    overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 9999 },
  circle1: { width: 300, height: 300, top: -100, right: -80 },
  circle2: { width: 250, height: 250, bottom: -50, left: -60 },
  circle3: { width: 180, height: 180, top: '35%', left: -40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 12, fontSize: 13, fontWeight: '600' },
});

export default AuthLoadingOverlay;


