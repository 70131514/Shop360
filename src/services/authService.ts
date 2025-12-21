import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  FirebaseAuthTypes,
  getIdToken as getIdTokenModular,
  getIdTokenResult,
  GoogleAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  reload as reloadModular,
  sendEmailVerification as sendEmailVerificationModular,
  sendPasswordResetEmail as sendPasswordResetEmailModular,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as signOutModular,
  updateEmail as updateEmailModular,
  updatePassword as updatePasswordModular,
  updateProfile,
} from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { doc, getDoc, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
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
 * Sign in with Google and return Firebase auth credential.
 * Also ensures a Firestore `users/{uid}` profile exists.
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Clear any stale session that can cause persistent DEVELOPER_ERROR on some devices.
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
    const signInResult = await GoogleSignin.signIn();
    // In newer versions, tokens are retrieved via getTokens() (signIn may not include idToken).
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens?.idToken;
    const accessToken = tokens?.accessToken;
    if (!idToken && !accessToken) {
      // User likely cancelled the sign-in or sign-in didn't complete
      const err: any = new Error('Sign-in was cancelled or incomplete. Please try again.');
      err.code = statusCodes.SIGN_IN_CANCELLED;
      throw err;
    }

    const credential = GoogleAuthProvider.credential(idToken ?? undefined, accessToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const u = userCredential.user;

    // IMPORTANT: refresh the ID token so Firestore rules see the latest claims immediately.
    try {
      await getIdTokenModular(u, true);
    } catch {
      // ignore; we will just best-effort profile creation below
    }

    // Use the ID token claim, not `user.emailVerified` (which can lag briefly).
    let tokenEmailVerified = false;
    try {
      const token = await getIdTokenResult(u, true);
      tokenEmailVerified = token?.claims?.email_verified === true;
    } catch {
      // ignore
    }

    // Ensure Firestore profile exists (best-effort).
    // If the account is not email-verified per token, rules will deny reads/writes: skip without failing login.
    if (tokenEmailVerified) {
      try {
        const uid = u.uid;
        const ref = doc(firebaseDb, 'users', uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const email = u.email ?? '';
          const name = u.displayName ?? (email ? email.split('@')[0] : 'User');
          await setDoc(ref, {
            uid,
            name,
            email,
            role: 'user',
            isEmailVerified: true,
            createdAt: serverTimestamp(),
          });
        }
      } catch (fireErr: any) {
        // eslint-disable-next-line no-console
        console.error('Google sign-in profile ensure failed (non-fatal):', fireErr);
      }
    }

    return userCredential;
  } catch (e: any) {
    // Keep the raw error visible in Metro logs for diagnosis.
    // eslint-disable-next-line no-console
    console.error('Google sign-in error (raw):', e);

    // Handle user cancellation gracefully
    if (
      e?.code === statusCodes.SIGN_IN_CANCELLED ||
      e?.code === 'SIGN_IN_CANCELLED' ||
      e?.message?.includes('cancelled') ||
      e?.message?.includes('canceled')
    ) {
      const err: any = new Error('Sign-in was cancelled. Please try again when ready.');
      err.code = statusCodes.SIGN_IN_CANCELLED;
      throw err;
    }

    // Improve the common Google Sign-In "DEVELOPER_ERROR" with actionable guidance.
    if (e?.code === statusCodes.DEVELOPER_ERROR || e?.message?.includes('DEVELOPER_ERROR')) {
      const err: any = new Error(
        'Google Sign-In configuration error (DEVELOPER_ERROR). ' +
          'Fix: enable Google provider in Firebase Console, add your Android SHA-1 to the Firebase Android app, ' +
          'then re-download and replace android/app/google-services.json and rebuild the app.',
      );
      err.code = e?.code ?? statusCodes.DEVELOPER_ERROR;
      throw err;
    }

    // Provide user-friendly error messages (hide technical details like tokens)
    let userMessage = 'Sign-in failed. Please try again.';
    if (e?.message?.includes('token')) {
      userMessage = 'Sign-in was cancelled or incomplete. Please try again.';
    } else if (e?.message) {
      // Only show message if it's user-friendly (not technical)
      const technicalTerms = ['token', 'idToken', 'accessToken', 'credential', 'DEVELOPER_ERROR'];
      const isTechnical = technicalTerms.some((term) =>
        e.message.toLowerCase().includes(term.toLowerCase()),
      );
      if (!isTechnical) {
        userMessage = e.message;
      }
    }

    const err: any = new Error(userMessage);
    err.code = e?.code;
    throw err;
  }
};

/**
 * Link Google provider to the CURRENT signed-in Firebase user.
 * Enforces that the Google account email matches the user's existing auth email.
 */
export async function linkGoogleToCurrentUser(): Promise<void> {
  const current = firebaseAuth.currentUser;
  if (!current) {
    throw new Error('No authenticated user');
  }
  const currentEmail = (current.email ?? '').trim().toLowerCase();
  if (!currentEmail) {
    throw new Error('This account has no email address to match.');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Clear any stale session before linking to reduce DEVELOPER_ERROR cases.
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
  
  let res;
  try {
    res = await GoogleSignin.signIn();
  } catch (e: any) {
    // Handle user cancellation gracefully
    if (
      e?.code === statusCodes.SIGN_IN_CANCELLED ||
      e?.code === 'SIGN_IN_CANCELLED' ||
      e?.message?.includes('cancelled') ||
      e?.message?.includes('canceled')
    ) {
      const err: any = new Error('Sign-in was cancelled.');
      err.code = statusCodes.SIGN_IN_CANCELLED;
      throw err;
    }
    throw e;
  }
  
  const googleEmail = (res?.user?.email ?? '').trim().toLowerCase();
  const tokens = await GoogleSignin.getTokens();
  const idToken = tokens?.idToken;
  const accessToken = tokens?.accessToken;
  if (!idToken && !accessToken) {
    // User likely cancelled the sign-in or sign-in didn't complete
    const err: any = new Error('Google sign-in was cancelled or incomplete.');
    err.code = statusCodes.SIGN_IN_CANCELLED;
    throw err;
  }
  if (googleEmail && googleEmail !== currentEmail) {
    throw new Error(`Please choose the Google account with the same email: ${current.email}`);
  }

  const credential = GoogleAuthProvider.credential(idToken ?? undefined, accessToken);

  try {
    await linkWithCredential(current, credential);
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Google link error (raw):', e);

    // If already linked, treat as success.
    if (e?.code === 'auth/provider-already-linked') {
      return;
    }
    throw e;
  }

  // Refresh token so claims/providers are immediately consistent.
  try {
    await getIdTokenModular(current, true);
  } catch {
    // ignore
  }
}

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

function requireCurrentUser(): FirebaseAuthTypes.User {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return user;
}

async function reauthenticateWithPassword(currentPassword: string): Promise<FirebaseAuthTypes.User> {
  const user = requireCurrentUser();
  const email = user.email;
  if (!email) {
    throw new Error('This account has no email address.');
  }
  const cred = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  return user;
}

/**
 * Change the signed-in user's email address.
 * Requires reauthentication (current password).
 *
 * Note: changing email resets Firebase `emailVerified` to false.
 */
export async function changeEmailAddress(newEmail: string, currentPassword: string): Promise<void> {
  const nextEmail = String(newEmail ?? '').trim();
  if (!nextEmail) {
    throw new Error('New email cannot be empty');
  }
  const user = await reauthenticateWithPassword(currentPassword);
  await updateEmailModular(user, nextEmail);

  // Refresh token so Firestore rules can see the new `request.auth.token.email`.
  try {
    await getIdTokenModular(user, true);
  } catch {
    // ignore; caller can retry
  }
}

/**
 * Change the signed-in user's password.
 * Requires reauthentication (current password).
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const next = String(newPassword ?? '');
  if (!next) {
    throw new Error('New password cannot be empty');
  }
  const user = await reauthenticateWithPassword(currentPassword);
  await updatePasswordModular(user, next);
}

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
