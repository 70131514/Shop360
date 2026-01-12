/**
 * Avatar storage initialization utility
 * Converts bundled avatar images to base64 and stores them in AsyncStorage
 * This allows avatars to work offline
 */

import { Image } from 'react-native';
import { AVATAR_SOURCES, type AvatarId } from '../constants/avatars';
import { areAvatarsInitialized, storeAllAvatars, storeAvatarImage } from './storage';

/**
 * Convert a bundled image to base64
 * Note: React Native bundled assets are not easily convertible to base64 at runtime
 * without additional libraries like react-native-fs.
 *
 * For production, consider:
 * 1. Pre-converting images to base64 at build time
 * 2. Using react-native-fs to read bundled assets
 * 3. Storing base64 data directly in code
 *
 * This function attempts conversion but may fail for bundled assets.
 * The app will fallback to bundled assets if conversion fails.
 */
async function imageToBase64(imageSource: any): Promise<string | null> {
  try {
    // Get the image URI from the bundled source
    const resolvedSource = Image.resolveAssetSource(imageSource);
    if (!resolvedSource?.uri) {
      console.warn('Could not resolve image source');
      return null;
    }

    // For bundled assets in React Native, the URI format varies by platform
    // Android: "res:/path" or numeric resource ID
    // iOS: "file:///path" or asset name
    // These are not directly fetchable via HTTP

    // Try to fetch if it's a valid HTTP/HTTPS/file URI
    if (
      resolvedSource.uri.startsWith('http://') ||
      resolvedSource.uri.startsWith('https://') ||
      resolvedSource.uri.startsWith('file://')
    ) {
      try {
        const response = await fetch(resolvedSource.uri);
        const blob = await response.blob();

        // Convert blob to base64 using a React Native-compatible approach
        // Note: This requires the blob to be readable, which may not work for all cases
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            try {
              const base64 = reader.result as string;
              // Remove data URL prefix if present
              const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
              resolve(base64Data);
            } catch (e) {
              reject(e);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        // Fetch failed - likely a bundled asset that can't be fetched
        console.warn(
          'Could not fetch image for base64 conversion (this is normal for bundled assets):',
          fetchError,
        );
        return null;
      }
    } else {
      // Bundled asset (res:// or numeric ID) - cannot be converted without native module
      console.warn(
        'Bundled asset detected - cannot convert to base64 at runtime without react-native-fs',
      );
      return null;
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

/**
 * Initialize all avatar images in AsyncStorage
 * This should be called once on app startup
 * If images can't be converted (bundled assets), they'll fallback to bundled sources
 */
export async function initializeAvatarStorage(): Promise<void> {
  try {
    // Check if already initialized
    const initialized = await areAvatarsInitialized();
    if (initialized) {
      console.log('Avatars already initialized in AsyncStorage');
      return;
    }

    console.log('Initializing avatar storage...');
    const avatarMap: Record<string, string> = {};

    // Try to convert each avatar to base64
    for (const [avatarId, imageSource] of Object.entries(AVATAR_SOURCES)) {
      try {
        const base64 = await imageToBase64(imageSource);
        if (base64) {
          avatarMap[avatarId] = base64;
          console.log(`✓ Stored avatar: ${avatarId}`);
        } else {
          console.warn(`⚠ Could not convert avatar ${avatarId} to base64, will use bundled asset`);
        }
      } catch (error) {
        console.error(`Error processing avatar ${avatarId}:`, error);
      }
    }

    // Store all successfully converted avatars
    if (Object.keys(avatarMap).length > 0) {
      await storeAllAvatars(avatarMap);
      console.log(`✓ Initialized ${Object.keys(avatarMap).length} avatars in AsyncStorage`);
    } else {
      console.warn('⚠ No avatars could be converted to base64. Using bundled assets as fallback.');
      // Mark as initialized anyway to avoid repeated attempts
      await storeAllAvatars({});
    }
  } catch (error) {
    console.error('Error initializing avatar storage:', error);
    // Don't throw - allow app to continue with bundled assets
  }
}

/**
 * Manually store a single avatar image (useful for custom avatars or updates)
 * @param avatarId - The avatar ID
 * @param base64Data - Base64 encoded image data
 */
export async function storeAvatarManually(avatarId: AvatarId, base64Data: string): Promise<void> {
  await storeAvatarImage(avatarId, base64Data);
  console.log(`✓ Manually stored avatar: ${avatarId}`);
}
