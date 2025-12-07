import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import CartScreen from '../screens/cart/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProductDetailsScreen from '../screens/product/ProductDetailsScreen';
import { ARViewScreen } from '../screens/ar/ARViewScreen';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Profile screens
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import ShippingAddressesScreen from '../screens/profile/ShippingAddressesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import WishlistScreen from '../screens/profile/WishlistScreen';
import OrderHistoryScreen from '../screens/profile/OrderHistoryScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width: screenWidth } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const circleRadius = 20;

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.background,
      height: 70 + (Platform.OS === 'ios' ? insets.bottom : 0),
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      position: 'relative',
    }}>
      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIconName = () => {
          switch (route.name) {
            case 'Home':
              return 'home-outline';
            case 'Products':
              return 'grid-outline';
            case 'Cart':
              return 'cart-outline';
            case 'Profile':
              return 'person-outline';
            default:
              return 'home-outline';
          }
        };

        const getTitle = () => {
          switch (route.name) {
            case 'Home':
              return 'Home';
            case 'Products':
              return 'Products';
            case 'Cart':
              return 'Cart';
            case 'Profile':
              return 'Profile';
            default:
              return 'Home';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Floating circle for active tab */}
            {isFocused && (
              <View
                style={{
                  position: 'absolute',
                  top: -12,
                  width: circleRadius * 2,
                  height: circleRadius * 2,
                  borderRadius: circleRadius,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name={getIconName() as any}
                  size={20}
                  color={colors.background}
                />
              </View>
            )}
            
            {/* Regular icon for inactive tabs */}
            {!isFocused && (
              <Ionicons
                name={getIconName() as any}
                size={22}
                color={colors.textSecondary}
                style={{ marginBottom: 4 }}
              />
            )}
            
            {/* Label */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: isFocused ? '600' : '500',
                color: isFocused ? colors.primary : colors.textSecondary,
                marginTop: isFocused ? 16 : 4,
                opacity: isFocused ? 1 : 0.8,
              }}
            >
              {getTitle()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth(); // Use auth state to determine which stack to show

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      text: colors.text,
      card: colors.background, // Match header background to app background
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right', // Smooth transitions
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              color: colors.text,
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: colors.background,
            }
          }}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen 
            name="ARView" 
            component={ARViewScreen} 
            options={{
                animation: 'fade', // AR often opens with a fade or modal style
                presentation: 'fullScreenModal',
            }}
          />
          
          {/* Profile Sub-screens */}
          <Stack.Screen 
            name="PersonalInfo" 
            component={PersonalInfoScreen} 
            options={{ headerShown: true, title: 'Personal Information' }}
          />
          <Stack.Screen 
            name="ShippingAddresses" 
            component={ShippingAddressesScreen}
            options={{ headerShown: true, title: 'Shipping Addresses' }} 
          />
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
            options={{ headerShown: true, title: 'Payment Methods' }}
          />
          <Stack.Screen 
            name="Wishlist" 
            component={WishlistScreen}
            options={{ headerShown: true, title: 'Wishlist' }} 
          />
          <Stack.Screen 
            name="Orders" 
            component={OrderHistoryScreen}
            options={{ headerShown: true, title: 'Order History' }} 
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ headerShown: true, title: 'Notifications' }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ headerShown: true, title: 'Settings' }} 
          />
          <Stack.Screen 
            name="HelpSupport" 
            component={HelpSupportScreen}
            options={{ headerShown: true, title: 'Help & Support' }} 
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
