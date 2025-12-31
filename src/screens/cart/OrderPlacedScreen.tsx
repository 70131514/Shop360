import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, StatusBar } from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

type OrderPlacedRouteParams = {
  orderId: string;
};

const OrderPlacedScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = (route.params as OrderPlacedRouteParams) || {};

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    Animated.sequence([
      // Circle scale and fade in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Checkmark appears
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Text fades in
      Animated.timing(textFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Button scales in
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewOrders = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }, { name: 'Orders' }],
    });
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={styles.content}>
        {/* Animated Circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: colors.primary + '20',
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.innerCircle,
              {
                backgroundColor: colors.primary + '40',
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Checkmark */}
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [{ scale: checkmarkScale }],
                  opacity: checkmarkOpacity,
                },
              ]}
            >
              <Ionicons name="checkmark" size={80} color={colors.primary} />
            </Animated.View>
          </Animated.View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFade,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Order Placed!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your order has been successfully placed
          </Text>
          {orderId && (
            <View style={[styles.orderIdContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.orderIdLabel, { color: colors.textSecondary }]}>Order ID</Text>
              <Text style={[styles.orderId, { color: colors.text }]}>
                #{String(orderId).slice(-8).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You will receive a confirmation email shortly. You can track your order in the Orders
            section.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleViewOrders}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={20} color={colors.background} />
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>
              View Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleContinueShopping}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  orderIdContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderPlacedScreen;
