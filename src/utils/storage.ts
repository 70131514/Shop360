import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  THEME: '@theme',
  USER: '@user',
  AUTH_TOKEN: '@auth_token',
  CART: '@cart',
  WISHLIST: '@wishlist',
  ADDRESSES: '@addresses',
  PAYMENT_METHODS: '@payment_methods',
  NOTIFICATION_PREFERENCES: '@notification_preferences',
  FONT_SIZE_PRESET: '@font_size_preset',
  AVATARS_INITIALIZED: '@avatars_initialized',
} as const;

export type FontSizePreset = 'xs' | 's' | 'm' | 'l' | 'xl';

// Theme storage
export const storeTheme = async (isDark: boolean) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error storing theme:', error);
  }
};

export const getTheme = async (): Promise<boolean | null> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme ? JSON.parse(theme) : null;
  } catch (error) {
    console.error('Error getting theme:', error);
    return null;
  }
};

// User storage
export const storeUser = async (user: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Auth token storage
export const storeAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Cart storage
export const storeCart = async (cart: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error storing cart:', error);
  }
};

export const getCart = async () => {
  try {
    const cart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

// Wishlist storage
export const storeWishlist = async (wishlist: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error storing wishlist:', error);
  }
};

export const getWishlist = async () => {
  try {
    const wishlist = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
};

// Addresses storage
export const storeAddresses = async (addresses: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
  } catch (error) {
    console.error('Error storing addresses:', error);
  }
};

export const getAddresses = async () => {
  try {
    const addresses = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    return addresses ? JSON.parse(addresses) : [];
  } catch (error) {
    console.error('Error getting addresses:', error);
    return [];
  }
};

// Payment methods storage
export const storePaymentMethods = async (paymentMethods: any[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
  } catch (error) {
    console.error('Error storing payment methods:', error);
  }
};

export const getPaymentMethods = async () => {
  try {
    const paymentMethods = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return paymentMethods ? JSON.parse(paymentMethods) : [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

// Notification preferences storage
export const storeNotificationPreferences = async (preferences: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error storing notification preferences:', error);
  }
};

export const getNotificationPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

// Font size preset storage (XS–XL)
export const storeFontSizePreset = async (preset: FontSizePreset) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE_PRESET, preset);
  } catch (error) {
    console.error('Error storing font size preset:', error);
  }
};

export const getFontSizePreset = async (): Promise<FontSizePreset | null> => {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE_PRESET);
    if (!v) {
      return null;
    }
    if (v === 'xs' || v === 's' || v === 'm' || v === 'l' || v === 'xl') {
      return v;
    }
    return null;
  } catch (error) {
    console.error('Error getting font size preset:', error);
    return null;
  }
};

// Avatar storage - stores avatar images as base64 in AsyncStorage
// Avatar ID is synced with Firestore, images are loaded from local storage for offline access

/**
 * Store a single avatar image in AsyncStorage as base64
 * @param avatarId - The avatar ID (e.g., 'm1', 'w2', 'user', 'admin')
 * @param base64Data - Base64 encoded image data
 */
export const storeAvatarImage = async (avatarId: string, base64Data: string): Promise<void> => {
  try {
    const key = `@avatar_${avatarId}`;
    await AsyncStorage.setItem(key, base64Data);
  } catch (error) {
    console.error(`Error storing avatar ${avatarId}:`, error);
  }
};

/**
 * Get a stored avatar image from AsyncStorage
 * @param avatarId - The avatar ID to retrieve
 * @returns Base64 encoded image data or null if not found
 */
export const getAvatarImage = async (avatarId: string): Promise<string | null> => {
  try {
    const key = `@avatar_${avatarId}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting avatar ${avatarId}:`, error);
    return null;
  }
};

/**
 * Store all avatar images at once
 * @param avatars - Object mapping avatar IDs to base64 data
 */
export const storeAllAvatars = async (avatars: Record<string, string>): Promise<void> => {
  try {
    const promises = Object.entries(avatars).map(([avatarId, base64Data]) =>
      storeAvatarImage(avatarId, base64Data),
    );
    await Promise.all(promises);
    // Mark avatars as initialized
    await AsyncStorage.setItem(STORAGE_KEYS.AVATARS_INITIALIZED, 'true');
  } catch (error) {
    console.error('Error storing all avatars:', error);
  }
};

/**
 * Check if avatars have been initialized in AsyncStorage
 * @returns True if avatars are initialized
 */
export const areAvatarsInitialized = async (): Promise<boolean> => {
  try {
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.AVATARS_INITIALIZED);
    return initialized === 'true';
  } catch (error) {
    console.error('Error checking avatar initialization:', error);
    return false;
  }
};

/**
 * Clear all stored avatar images
 */
export const clearAvatarImages = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const avatarKeys = keys.filter((key) => key.startsWith('@avatar_'));
    await AsyncStorage.multiRemove([...avatarKeys, STORAGE_KEYS.AVATARS_INITIALIZED]);
  } catch (error) {
    console.error('Error clearing avatar images:', error);
  }
};

// Clear all storage
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};
