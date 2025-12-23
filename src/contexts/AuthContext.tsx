import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  FirebaseAuthTypes,
  onAuthStateChanged as onAuthStateChangedModular,
  reload as reloadModular,
  signOut as signOutModular,
} from '@react-native-firebase/auth';
import {
  changeEmailAddress,
  changePassword,
  linkGoogleToCurrentUser,
  reloadCurrentUser,
  resendEmailVerification,
  sendPasswordResetEmail,
  signInWithGoogle,
  signIn,
  signOut,
  signUp,
} from '../services/authService';
import { firebaseAuth } from '../services/firebase';
import { migrateGuestCartToUserCart } from '../services/cartService';
import {
  markMyEmailVerified,
  subscribeMyUserProfile,
  type UserProfileDoc,
  updateMyEmailAndMarkUnverified,
} from '../services/userService';

type User = FirebaseAuthTypes.User | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  checkingEmailVerification: boolean;
  emailVerificationChecked: boolean;
  isEmailVerified: boolean;
  profile: UserProfileDoc | null;
  role: string | null;
  isAdmin: boolean;
  welcomeBackRequestId: number;
  requestWelcomeBack: () => void;
  authTransitionActive: boolean;
  clearAuthTransition: () => void;
  login: (email: string, password: string) => Promise<{ emailVerified: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ emailVerified: boolean }>;
  logout: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loginWithGoogle: () => Promise<{ emailVerified: boolean }>;
  linkGoogleAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingEmailVerification, setCheckingEmailVerification] = useState<boolean>(false);
  const [emailVerificationChecked, setEmailVerificationChecked] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [welcomeBackRequestId, setWelcomeBackRequestId] = useState<number>(0);
  const [authTransitionActive, setAuthTransitionActive] = useState(false);

  // Handle user state changes
  function handleAuthStateChanged(nextUser: User) {
    setUser(nextUser);
    setIsEmailVerified(nextUser?.emailVerified === true);
    setLoading(false);
    if (!nextUser) {
      setWelcomeBackRequestId(0);
    }
  }

  /**
   * If you want the app to ALWAYS start on Login/Signup (even if Firebase has a cached session),
   * keep this as true. Set to false when you want persistent login across app restarts.
   */
  const FORCE_LOGIN_ON_APP_LAUNCH = false;
  const didForceLogoutRef = useRef(false);
  const lastVerificationCheckUidRef = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    const init = async () => {
      try {
        if (FORCE_LOGIN_ON_APP_LAUNCH && !didForceLogoutRef.current) {
          // Ensure initial screen is auth flow every launch
          await signOutModular(firebaseAuth);
          didForceLogoutRef.current = true;
        }

        // Keep auth state simple/stable. Any "post-signup" sign-out is handled inside register()
        // after Firestore has been written successfully.
        unsubscribe = onAuthStateChangedModular(firebaseAuth, (nextUser) => {
          handleAuthStateChanged(nextUser);

          // Reset profile state immediately on auth changes
          setProfile(null);
          setRole(null);
        });
      } catch (e) {
        // If anything goes wrong, still unblock the UI
        setUser(null);
        setCheckingEmailVerification(false);
        setEmailVerificationChecked(true);
        setIsEmailVerified(false);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // firebaseAuth is stable per app; do not resubscribe on state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseAuth]);

  // Keep emailVerified fresh (avoids briefly routing verified users to VerifyEmailScreen)
  useEffect(() => {
    const uid = user?.uid ?? null;
    if (!uid) {
      lastVerificationCheckUidRef.current = null;
      setCheckingEmailVerification(false);
      setEmailVerificationChecked(true);
      setIsEmailVerified(false);
      return;
    }

    if (lastVerificationCheckUidRef.current === uid && emailVerificationChecked) {
      return;
    }
    lastVerificationCheckUidRef.current = uid;

    let alive = true;
    setCheckingEmailVerification(true);
    setEmailVerificationChecked(false);
    (async () => {
      try {
        const verified = await reloadCurrentUser();
        if (!alive) {
          return;
        }
        setUser(firebaseAuth.currentUser);
        setIsEmailVerified(verified);
        if (verified) {
          try {
            await markMyEmailVerified();
          } catch {
            // ignore
          }
        }
      } finally {
        if (alive) {
          setCheckingEmailVerification(false);
          setEmailVerificationChecked(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.uid, emailVerificationChecked]);

  // Subscribe to profile only after verification (rules enforce this)
  useEffect(() => {
    if (!user || !isEmailVerified) {
      setProfile(null);
      setRole(null);
      return;
    }
    let unsub: undefined | (() => void);
    try {
      unsub = subscribeMyUserProfile(
        (p) => {
          setProfile(p);
          setRole(p?.role ?? null);
        },
        () => {
          setProfile(null);
          setRole(null);
        },
      );
    } catch {
      setProfile(null);
      setRole(null);
    }
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [user, isEmailVerified]);

  const login = async (email: string, password: string) => {
    setAuthTransitionActive(true);
    try {
      await signIn(email, password);
      // Ensure immediate UI update even if auth listener lags
      setUser(firebaseAuth.currentUser);
      const verified = await reloadCurrentUser();
      setUser(firebaseAuth.currentUser);
      setIsEmailVerified(verified);

      // Only migrate into Firestore cart once verified (rules will enforce this)
      if (verified) {
        // Best-effort: store attribute in Firestore profile (now that token is refreshed)
        try {
          await markMyEmailVerified();
        } catch {
          // ignore
        }
      await migrateGuestCartToUserCart();
      } else {
        // Best-effort: send verification email again
        try {
          await resendEmailVerification();
        } catch {
          // ignore
        }
      }

      return { emailVerified: verified };
    } catch (error) {
      setAuthTransitionActive(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await signUp(email, password, name);
      // Keep the new user signed-in so they can continue as "guest -> signed-in" smoothly.
      setUser(firebaseAuth.currentUser);
      const verified = await reloadCurrentUser();
      setUser(firebaseAuth.currentUser);
      setIsEmailVerified(verified);

      // New accounts will be unverified; do NOT migrate cart yet (Firestore writes blocked)
      if (verified) {
        try {
          await markMyEmailVerified();
        } catch {
          // ignore
        }
      await migrateGuestCartToUserCart();
      }

      return { emailVerified: verified };
    } catch (error) {
      throw error;
    }
  };

  const refreshEmailVerification = async () => {
    const verified = await reloadCurrentUser();
    setUser(firebaseAuth.currentUser);
    setIsEmailVerified(verified);

    if (verified) {
      // Best-effort: store attribute in Firestore profile
      try {
        await markMyEmailVerified();
      } catch {
        // ignore
      }
    }

    return verified;
  };

  const resendVerificationEmail = async () => {
    await resendEmailVerification();
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(email);
  };

  const updateEmail = async (newEmail: string, currentPassword: string) => {
    await changeEmailAddress(newEmail, currentPassword);

    // Update Firestore profile to new email and mark it unverified.
    // Rules will allow this specific update even though the new email is not verified yet.
    await updateMyEmailAndMarkUnverified(newEmail);

    // Send verification email to the new address (best-effort)
    try {
      await resendEmailVerification();
    } catch {
      // ignore
    }

    // Force re-login with the new email after verification.
    await logout();
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  const loginWithGoogle = async () => {
    setAuthTransitionActive(true);
    await signInWithGoogle();
    setUser(firebaseAuth.currentUser);
    const verified = await reloadCurrentUser();
    setUser(firebaseAuth.currentUser);
    setIsEmailVerified(verified);

    if (verified) {
      try {
        await markMyEmailVerified();
      } catch {
        // ignore
      }
      await migrateGuestCartToUserCart();
    }

    return { emailVerified: verified };
  };

  const requestWelcomeBack = () => {
    setWelcomeBackRequestId((v) => v + 1);
  };

  const clearAuthTransition = () => {
    setAuthTransitionActive(false);
  };

  const linkGoogleAccount = async () => {
    const current = firebaseAuth.currentUser;
    if (!current) {
      throw new Error('No authenticated user');
    }
    if (current.emailVerified !== true) {
      throw new Error('Please verify your email first, then try again.');
    }
    await linkGoogleToCurrentUser();
    // Reload user to get updated providerData
    await reloadModular(current);
    // Refresh local user reference
    setUser(firebaseAuth.currentUser);
  };

  const logout = async () => {
    try {
      // signOut is safe even if already signed out; treat "no-current-user" as success.
      await signOut();
      setUser(null);
      setIsEmailVerified(false);
      setProfile(null);
      setRole(null);
      setAuthTransitionActive(false);
    } catch (error: any) {
      if (error?.code === 'auth/no-current-user') {
        setUser(null);
        setIsEmailVerified(false);
        setProfile(null);
        setRole(null);
        setAuthTransitionActive(false);
        return;
      }
      throw error;
    }
  };

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        checkingEmailVerification,
        emailVerificationChecked,
        isEmailVerified,
        profile,
        role,
        isAdmin,
        welcomeBackRequestId,
        requestWelcomeBack,
        authTransitionActive,
        clearAuthTransition,
        login,
        register,
        logout,
        refreshEmailVerification,
        resendVerificationEmail,
        resetPassword,
        updateEmail,
        updatePassword,
        loginWithGoogle,
        linkGoogleAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export default AuthContext;
