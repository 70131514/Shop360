import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../../components/common/AppText';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { type AvatarId } from '../../constants/avatars';
import { getAvatarSource } from '../../utils/avatarUtils';
import { updateMyAvatarId } from '../../services/userService';
import { useAppAlert } from '../../contexts/AppAlertContext';

const { width, height } = Dimensions.get('window');

const AvatarFinalWelcomeScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { user, profile, isAdmin } = useAuth();
  const { alert } = useAppAlert();

  const selectedAvatarId = (route?.params?.avatarId ?? 'user') as AvatarId;
  const name = profile?.name ?? user?.displayName ?? 'User';

  const avatarY = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(10)).current;
  const savingFade = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = React.useState(false);
  const didSaveRef = useRef(false);

  // Background animations
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle2Scale = useRef(new Animated.Value(1)).current;
  const circle3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createFloatingAnimation = (
      animValue: Animated.Value,
      duration: number,
      delay: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration, useNativeDriver: true }),
        ]),
      );
    };

    const createScaleAnimation = (animValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, { toValue: 1.2, duration, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 1, duration, useNativeDriver: true }),
        ]),
      );
    };

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

    let alive = true;

    Animated.sequence([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(avatarY, {
          toValue: -28,
          duration: 540,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(avatarScale, {
          toValue: 0.96,
          duration: 540,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
    ]).start(async () => {
      if (!alive) {
        return;
      }
      if (didSaveRef.current) {
        return;
      }
      if (!user) {
        alert('Sign in required', 'Please sign in to complete setup.');
        return;
      }
      if (isAdmin) {
        // Admin avatar is enforced elsewhere.
        return;
      }
      try {
        didSaveRef.current = true;
        setSaving(true);
        Animated.timing(savingFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        await updateMyAvatarId(selectedAvatarId);
        // Smoothly exit to Home after a short hold.
        Animated.timing(screenFade, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
            });
          } catch {
            // ignore
          }
        });
      } catch (e: any) {
        alert('Could not save avatar', e?.message ?? 'Please try again.');
        didSaveRef.current = false;
      } finally {
        setSaving(false);
      }
    });

    return () => {
      alive = false;
      float1.stop();
      float2.stop();
      float3.stop();
      scale1.stop();
      scale2.stop();
      scale3.stop();
    };
  }, [
    alert,
    avatarScale,
    avatarY,
    circle1,
    circle1Scale,
    circle2,
    circle2Scale,
    circle3,
    circle3Scale,
    isAdmin,
    savingFade,
    screenFade,
    selectedAvatarId,
    textFade,
    textY,
    navigation,
    user,
  ]);

  const circle1TranslateY = circle1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const circle2TranslateY = circle2.interpolate({ inputRange: [0, 1], outputRange: [0, 25] });
  const circle3TranslateY = circle3.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  return (
    <Animated.View style={{ flex: 1, opacity: screenFade }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundContainer}>
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

      <View style={styles.content}>
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ translateY: avatarY }, { scale: avatarScale }] }}>
            <View style={[styles.ring, { borderColor: colors.primary }]}>
              <Image source={getAvatarSource(selectedAvatarId)} style={styles.avatar} />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: textFade, transform: [{ translateY: textY }] }}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome, {name}.</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your avatar is set — you can change it anytime.
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: savingFade }}>
            {saving && (
              <View style={styles.savingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.savingText, { color: colors.textSecondary }]}>Saving…</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundContainer: { position: 'absolute', width, height, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 9999 },
  circle1: { width: 300, height: 300, top: -100, right: -80 },
  circle2: { width: 250, height: 250, bottom: -50, left: -60 },
  circle3: { width: 180, height: 180, top: '35%', left: -40 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  center: { alignItems: 'center' },
  ring: { borderWidth: 3, borderRadius: 70, padding: 4, marginBottom: 14 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 0.2 },
  subtitle: { marginTop: 8, fontSize: 13, textAlign: 'center' },
  savingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  savingText: { marginLeft: 10, fontSize: 12, fontWeight: '600' },
});

export default AvatarFinalWelcomeScreen;


