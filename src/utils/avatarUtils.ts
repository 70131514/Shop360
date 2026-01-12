/**
 * Avatar utility functions for optimized avatar handling
 * Loads avatars from AsyncStorage first (for offline access), then falls back to bundled assets
 * Avatar ID is synced with Firestore, images are stored locally in AsyncStorage
 */

import { Image } from 'react-native';
import { AVATAR_SOURCES, type AvatarId, resolveAvatarId } from '../constants/avatars';
import { getAvatarImage } from './storage';

// Cache for loaded avatar URIs to avoid repeated AsyncStorage reads
const avatarCache = new Map<string, any>();

/**
 * Get the avatar image source for a given avatar ID (synchronous, uses bundled assets)
 * This is a fallback function that uses bundled assets directly
 * 
 * @param avatarId - The avatar ID to get the source for
 * @param fallbackId - Fallback avatar ID (defaults to 'user')
 * @returns The image source object for React Native Image component
 */
export function getAvatarSource(
  avatarId: string | null | undefined,
  fallbackId: AvatarId = 'user',
): any {
  if (!avatarId) {
    return AVATAR_SOURCES[fallbackId];
  }

  const trimmedId = avatarId.trim() as AvatarId;
  if (trimmedId && trimmedId in AVATAR_SOURCES) {
    return AVATAR_SOURCES[trimmedId];
  }

  // Fallback to default avatar if ID is invalid
  return AVATAR_SOURCES[fallbackId];
}

/**
 * Get the avatar image source from AsyncStorage (async, loads from local storage)
 * Falls back to bundled assets if not found in AsyncStorage
 * 
 * @param avatarId - The avatar ID to get the source for
 * @param fallbackId - Fallback avatar ID (defaults to 'user')
 * @returns Promise resolving to the image source object for React Native Image component
 */
export async function getAvatarSourceAsync(
  avatarId: string | null | undefined,
  fallbackId: AvatarId = 'user',
): Promise<any> {
  // Use fallback if no avatarId provided
  if (!avatarId) {
    return getAvatarSourceFromStorage(fallbackId) || AVATAR_SOURCES[fallbackId];
  }

  const trimmedId = avatarId.trim() as AvatarId;
  if (!trimmedId || !(trimmedId in AVATAR_SOURCES)) {
    return getAvatarSourceFromStorage(fallbackId) || AVATAR_SOURCES[fallbackId];
  }

  // Try to load from AsyncStorage first
  const storedSource = await getAvatarSourceFromStorage(trimmedId);
  if (storedSource) {
    return storedSource;
  }

  // Fallback to bundled asset
  return AVATAR_SOURCES[trimmedId];
}

/**
 * Get avatar source from AsyncStorage cache or load it
 * @param avatarId - The avatar ID to retrieve
 * @returns Image source object or null if not found
 */
async function getAvatarSourceFromStorage(avatarId: AvatarId): Promise<any | null> {
  // Check cache first
  if (avatarCache.has(avatarId)) {
    return avatarCache.get(avatarId);
  }

  try {
    // Try to load from AsyncStorage
    const base64Data = await getAvatarImage(avatarId);
    if (base64Data) {
      // Create data URI for base64 image
      const source = { uri: `data:image/png;base64,${base64Data}` };
      // Cache it
      avatarCache.set(avatarId, source);
      return source;
    }
  } catch (error) {
    console.error(`Error loading avatar ${avatarId} from storage:`, error);
  }

  return null;
}

/**
 * Clear the avatar cache (useful when avatars are updated)
 */
export function clearAvatarCache(): void {
  avatarCache.clear();
}

/**
 * Resolve avatar ID with proper validation and fallback
 * This is a wrapper around resolveAvatarId with additional safety checks
 * 
 * @param params - Parameters for avatar resolution
 * @returns A valid AvatarId
 */
export function resolveAvatarIdSafe(params: {
  avatarId?: string | null;
  isGuest: boolean;
  isAdmin: boolean;
}): AvatarId {
  try {
    return resolveAvatarId(params);
  } catch (error) {
    // If resolution fails, return default based on user type
    if (params.isAdmin) {
      return 'admin';
    }
    return 'user';
  }
}

/**
 * Get avatar source with user context (optimized for profile display)
 * Automatically handles admin, guest, and regular user cases
 * Uses bundled assets (synchronous version)
 * 
 * @param params - Avatar resolution parameters
 * @returns The image source object
 */
export function getAvatarSourceForUser(params: {
  avatarId?: string | null;
  isGuest: boolean;
  isAdmin: boolean;
}): any {
  const resolvedId = resolveAvatarIdSafe(params);
  return AVATAR_SOURCES[resolvedId];
}

/**
 * Get avatar source with user context from AsyncStorage (async version)
 * Loads from local storage first, then falls back to bundled assets
 * 
 * @param params - Avatar resolution parameters
 * @returns Promise resolving to the image source object
 */
export async function getAvatarSourceForUserAsync(params: {
  avatarId?: string | null;
  isGuest: boolean;
  isAdmin: boolean;
}): Promise<any> {
  const resolvedId = resolveAvatarIdSafe(params);
  return getAvatarSourceAsync(resolvedId, resolvedId);
}

/**
 * Validate if an avatar ID exists in the available avatars
 * 
 * @param avatarId - The avatar ID to validate
 * @returns True if the avatar ID is valid
 */
export function isValidAvatarId(avatarId: string | null | undefined): boolean {
  if (!avatarId) {
    return false;
  }
  const trimmedId = avatarId.trim() as AvatarId;
  return trimmedId in AVATAR_SOURCES;
}

