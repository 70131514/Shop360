import {
  createUserWithEmailAndPassword,
  deleteUser,
  FirebaseAuthTypes,
  getIdToken as getIdTokenModular,
  reload as reloadModular,
  sendEmailVerification as sendEmailVerificationModular,
  sendPasswordResetEmail as sendPasswordResetEmailModular,
  signInWithEmailAndPassword,
  signOut as signOutModular,
  updateProfile,
} from '@react-native-firebase/auth';
import { doc, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export class EmailNotVerifiedError extends Error {
  code = 'auth/email-not-verified';
  constructor(message: string = 'Email address is not verified') {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<FirebaseAuthTypes.UserCredential>}
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (error) {
    throw error;
  }
};

/**
 * Sign up with email, password, and additional details
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {string} role - defaults to 'user'
 * @returns {Promise<FirebaseAuthTypes.UserCredential>}
 */
export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: string = 'user',
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const { uid } = userCredential.user;

    try {
      // 2. Update display name in Auth
      await updateProfile(userCredential.user, { displayName: name });

      // 3. Create user document in Firestore
      // Use the email from Auth to match rules like `request.auth.token.email`
      const authEmail = userCredential.user.email ?? email;
      await setDoc(doc(firebaseDb, 'users', uid), {
        uid,
        name,
        email: authEmail,
        role,
        isEmailVerified: false,
        createdAt: serverTimestamp(),
      });

      // 4. Send email verification (best-effort)
      try {
        await sendEmailVerificationModular(userCredential.user);
      } catch (_) {
        // ignore email verification send failures
      }
    } catch (innerError) {
      // If Firestore write fails, rollback the auth user so the email isn't "stuck" in Auth
      try {
        await deleteUser(userCredential.user);
      } catch (_) {
        // ignore rollback failures
      }
      throw innerError;
    }

    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async (): Promise<void> => {
  try {
    return await signOutModular(firebaseAuth);
  } catch (error) {
    // If already signed out, treat as success.
    if ((error as any)?.code === 'auth/no-current-user') {
      return;
    }
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    return await sendPasswordResetEmailModular(firebaseAuth, email);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user
 * @returns {FirebaseAuthTypes.User | null}
 */
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

export async function resendEmailVerification(): Promise<void> {
  const current = firebaseAuth.currentUser;
  if (!current) {
    throw new Error('No authenticated user');
  }
  await sendEmailVerificationModular(current);
}

/**
 * Reload the current user from Firebase so `emailVerified` updates without restarting the app.
 * Returns the latest `emailVerified` value.
 */
export async function reloadCurrentUser(): Promise<boolean> {
  const current = firebaseAuth.currentUser;
  if (!current) {
    return false;
  }
  await reloadModular(current);
  // IMPORTANT: rely on the reloaded `current` user object; `firebaseAuth.currentUser` can lag briefly.
  const verified = current.emailVerified === true;

  // Firestore rules read `request.auth.token.email_verified`, which can lag behind `user.emailVerified`
  // until the ID token refreshes. Force-refresh the token so rules see the verified claim immediately.
  if (verified) {
    try {
      await getIdTokenModular(current, true);
    } catch {
      // ignore token refresh failures; user can retry
    }
  }

  return verified;
}
