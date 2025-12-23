import { updateProfile } from '@react-native-firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type UserProfileDoc = {
  uid: string;
  name: string;
  email: string;
  role: 'user' | string;
  avatarId?: string;
  isEmailVerified?: boolean;
  createdAt: any;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

export async function getMyUserProfile(): Promise<UserProfileDoc> {
  const uid = requireUid();
  const snap = await getDoc(doc(firebaseDb, 'users', uid));
  if (!snap.exists()) {
    throw new Error('User profile not found');
  }
  return snap.data() as UserProfileDoc;
}

export function subscribeMyUserProfile(
  onProfile: (profile: UserProfileDoc | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  return onSnapshot(
    doc(firebaseDb, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onProfile(null);
        return;
      }
      onProfile(snap.data() as UserProfileDoc);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Update the current user's display name in BOTH:
 * - Firestore: users/{uid}.name (required by your rules)
 * - Firebase Auth: user.displayName (for UI convenience)
 */
export async function updateMyName(name: string): Promise<void> {
  const uid = requireUid();
  const trimmed = String(name ?? '').trim();
  if (!trimmed) {
    throw new Error('Name cannot be empty');
  }

  await updateDoc(doc(firebaseDb, 'users', uid), { name: trimmed } as any);

  // Keep Firebase Auth displayName in sync (best-effort)
  const current = firebaseAuth.currentUser;
  if (current) {
    try {
      await updateProfile(current, { displayName: trimmed });
    } catch {
      // ignore auth profile sync failures; Firestore is the source of truth
    }
  }
}

/**
 * Best-effort: mark the user's Firestore profile as email-verified.
 * Firestore rules should require `request.auth.token.email_verified == true` for this to succeed.
 */
export async function markMyEmailVerified(): Promise<void> {
  const uid = requireUid();
  await updateDoc(doc(firebaseDb, 'users', uid), { isEmailVerified: true } as any);
}

/**
 * Update the Firestore profile email and mark it unverified.
 * Intended to be called immediately after Firebase Auth `updateEmail()`.
 */
export async function updateMyEmailAndMarkUnverified(email: string): Promise<void> {
  const uid = requireUid();
  const nextEmail = String(email ?? '').trim();
  if (!nextEmail) {
    throw new Error('Email cannot be empty');
  }
  await updateDoc(doc(firebaseDb, 'users', uid), { email: nextEmail, isEmailVerified: false } as any);
}

export async function updateMyAvatarId(avatarId: string): Promise<void> {
  const uid = requireUid();
  const next = String(avatarId ?? '').trim();
  if (!next) {
    throw new Error('Avatar is required');
  }
  await updateDoc(doc(firebaseDb, 'users', uid), { avatarId: next } as any);
}
