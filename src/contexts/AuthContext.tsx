import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  FirebaseAuthTypes,
  onAuthStateChanged as onAuthStateChangedModular,
  signOut as signOutModular,
} from '@react-native-firebase/auth';
import { signIn, signOut, signUp } from '../services/authService';
import { firebaseAuth } from '../services/firebase';

type User = FirebaseAuthTypes.User | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Handle user state changes
  function handleAuthStateChanged(nextUser: User) {
    setUser(nextUser);
    setLoading(false);
  }

  /**
   * If you want the app to ALWAYS start on Login/Signup (even if Firebase has a cached session),
   * keep this as true. Set to false when you want persistent login across app restarts.
   */
  const FORCE_LOGIN_ON_APP_LAUNCH = false;
  const didForceLogoutRef = useRef(false);

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
        unsubscribe = onAuthStateChangedModular(firebaseAuth, handleAuthStateChanged);
      } catch (e) {
        // If anything goes wrong, still unblock the UI
        setUser(null);
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

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Ensure immediate UI update even if auth listener lags
      setUser(firebaseAuth.currentUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await signUp(email, password, name);
      // After successful signup + Firestore write, sign out so user goes to Login screen.
      await signOutModular(firebaseAuth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // signOut is safe even if already signed out; treat "no-current-user" as success.
      await signOut();
      setUser(null);
    } catch (error: any) {
      if (error?.code === 'auth/no-current-user') {
        setUser(null);
        return;
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
