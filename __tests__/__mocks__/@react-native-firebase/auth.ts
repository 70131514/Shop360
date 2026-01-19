// Mock for @react-native-firebase/auth
export const getAuth = jest.fn(() => ({
  currentUser: null,
}));

export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const sendPasswordResetEmail = jest.fn();
export const sendEmailVerification = jest.fn();
export const updateProfile = jest.fn();
export const updateEmail = jest.fn();
export const updatePassword = jest.fn();
export const deleteUser = jest.fn();
export const reload = jest.fn();
export const getIdToken = jest.fn();
export const getIdTokenResult = jest.fn();
export const reauthenticateWithCredential = jest.fn();
export const linkWithCredential = jest.fn();
export const signInWithCredential = jest.fn();
export const GoogleAuthProvider = {
  credential: jest.fn(),
};
export const EmailAuthProvider = {
  credential: jest.fn(),
};
