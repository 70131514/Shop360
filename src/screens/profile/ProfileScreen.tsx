import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getWishlist } from '../../services/wishlistService';
import { subscribeOrderCount } from '../../services/orderService';

type MenuItem = {
  icon: string;
  title: string;
  subtitle: string;
  route: string;
};

const ProfileScreen = () => {
  const { colors } = useTheme();
  // Safe check for useAuth just in case it's not fully ready
  const auth = useAuth();
  const logout = auth?.logout || (() => console.log('Logout not implemented'));
  const user = auth?.user;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const isGuest = !user;

  useEffect(() => {
    const loadWishlistCount = async () => {
      try {
        const wishlist = await getWishlist();
        setWishlistCount(wishlist.length);
      } catch {
        setWishlistCount(0);
      }
    };
    loadWishlistCount();

    // Add focus listener to refresh data
    const unsubscribe = navigation.addListener('focus', () => {
      loadWishlistCount();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Live order count for the signed-in user
    let unsub: undefined | (() => void);
    try {
      unsub = subscribeOrderCount(
        (count) => setOrderCount(count),
        () => setOrderCount(0),
      );
    } catch {
      // Likely signed out / no uid yet
      setOrderCount(0);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [user?.uid]);

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      route: 'PersonalInfo',
    },
    {
      icon: 'location-outline',
      title: 'Shipping Addresses',
      subtitle: 'Manage your delivery addresses',
      route: 'ShippingAddresses',
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      route: 'PaymentMethods',
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      subtitle: 'View your saved items',
      route: 'Wishlist',
    },
    {
      icon: 'time-outline',
      title: 'Order History',
      subtitle: 'View your past orders',
      route: 'Orders',
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      route: 'Notifications',
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and settings',
      route: 'Settings',
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      route: 'HelpSupport',
    },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (e: any) {
      // Even if something went wrong, avoid unhandled promise rejections.
      const msg = e?.message ?? 'Failed to log out';
      Alert.alert('Logout', msg);
    } finally {
      setLoggingOut(false);
    }
  };

  const promptAuth = (reason: string, redirectToTab: 'Profile' | 'Cart' | 'Home' | 'Products') => {
    Alert.alert('Sign in required', reason, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => navigation.navigate('Login', { redirectToTab }) },
      { text: 'Create Account', onPress: () => navigation.navigate('Signup', { redirectToTab }) },
    ]);
  };

  const handleMenuPress = (route: string) => {
    const routesRequiringAuth = new Set([
      'PersonalInfo',
      'ShippingAddresses',
      'PaymentMethods',
      'Wishlist',
      'Orders',
      'Notifications',
      'Settings',
    ]);

    if (isGuest && routesRequiringAuth.has(route)) {
      promptAuth('Please sign in to access this section.', 'Profile');
      return;
    }

    navigation.navigate(route);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 0) + 10 }]}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop',
                }}
                style={[styles.profileImage, { borderColor: colors.primary }]}
              />
              <TouchableOpacity
                style={[
                  styles.cameraButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.background,
                  },
                ]}
                onPress={() => {}}
              >
                <Ionicons name="camera" size={16} color={colors.background} />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {isGuest ? 'Guest' : user?.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {isGuest ? 'You are browsing in guest mode' : user?.email || 'No email'}
              </Text>
            </View>
          </View>
        </View>

        {isGuest ? (
          <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.authCardHeader}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.authCardTitle, { color: colors.text }]}>
                Sign in to unlock wishlist & checkout
              </Text>
            </View>
            <Text style={[styles.authCardSubtitle, { color: colors.textSecondary }]}>
              Your cart is saved on this device. Sign in to sync it and access your wishlist & order history.
            </Text>
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Login', { redirectToTab: 'Profile' })}
              >
                <Text style={[styles.authButtonText, { color: colors.background }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authButtonOutline, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('Signup', { redirectToTab: 'Profile' })}
              >
                <Text style={[styles.authButtonText, { color: colors.text }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color="#FF3B30" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={[styles.logoutText, { color: '#FF3B30' }]}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="bag-outline" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{orderCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Orders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="heart-outline"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <Text style={[styles.statNumber, { color: colors.text }]}>{wishlistCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wishlist</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="location-outline"
              size={24}
              color={colors.primary}
              style={styles.statIcon}
            />
            <Text style={[styles.statNumber, { color: colors.text }]}>2</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Addresses</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={() => {
                handleMenuPress(item.route);
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon} size={20} color={colors.icon} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    width: '90%',
    alignSelf: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  authCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  authCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  authCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  authCardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;
