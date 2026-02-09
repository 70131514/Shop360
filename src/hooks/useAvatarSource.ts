/**
 * React hook for loading avatar images from AsyncStorage
 * Loads from local storage first, then falls back to bundled assets
 */

import { useState, useEffect } from 'react';
import {
  getAvatarSource,
  getAvatarSourceAsync,
  getAvatarSourceForUser,
  getAvatarSourceForUserAsync,
} from '../utils/avatarUtils';
import type { AvatarId } from '../constants/avatars';

/**
 * Hook to get avatar source asynchronously
 * @param avatarId - The avatar ID to load
 * @param fallbackId - Fallback avatar ID (defaults to 'user')
 * @returns The image source object for React Native Image component
 */
export function useAvatarSource(
  avatarId: string | null | undefined,
  fallbackId: AvatarId = 'user',
): any {
  // Always start with bundled asset so UI never renders blank.
  const [source, setSource] = useState<any>(() => getAvatarSource(avatarId, fallbackId));

  useEffect(() => {
    let mounted = true;

    const loadAvatar = async () => {
      try {
        // Immediately set bundled fallback for this render cycle.
        if (mounted) {
          setSource(getAvatarSource(avatarId, fallbackId));
        }

        const avatarSource = await getAvatarSourceAsync(avatarId, fallbackId);
        if (mounted) {
          setSource(avatarSource);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
        // Fallback to bundled asset
        if (mounted) {
          setSource(getAvatarSource(avatarId, fallbackId));
        }
      }
    };

    loadAvatar();

    return () => {
      mounted = false;
    };
  }, [avatarId, fallbackId]);

  return source;
}

/**
 * Hook to get avatar source with user context
 * @param params - Avatar resolution parameters
 * @returns The image source object
 */
export function useAvatarSourceForUser(params: {
  avatarId?: string | null;
  isGuest: boolean;
  isAdmin: boolean;
}): any {
  // Always start with bundled asset so UI never renders blank.
  const [source, setSource] = useState<any>(() => getAvatarSourceForUser(params));

  useEffect(() => {
    let mounted = true;

    const loadAvatar = async () => {
      try {
        // Immediately set bundled fallback for this render cycle.
        if (mounted) {
          setSource(getAvatarSourceForUser(params));
        }

        const avatarSource = await getAvatarSourceForUserAsync(params);
        if (mounted) {
          setSource(avatarSource);
        }
      } catch (error) {
        console.error('Error loading avatar for user:', error);
        // Fallback to bundled asset
        if (mounted) {
          setSource(getAvatarSourceForUser(params));
        }
      }
    };

    loadAvatar();

    return () => {
      mounted = false;
    };
  }, [params.avatarId, params.isGuest, params.isAdmin]);

  return source;
}
