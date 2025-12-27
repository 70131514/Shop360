/**
 * Avatar utility functions for optimized avatar handling
 * Ensures avatars are properly bundled and displayed with fallback support
 */

import { AVATAR_SOURCES, type AvatarId, resolveAvatarId } from '../constants/avatars';

/**
 * Get the avatar image source for a given avatar ID
 * Includes fallback to 'user' avatar if the provided ID is invalid
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

