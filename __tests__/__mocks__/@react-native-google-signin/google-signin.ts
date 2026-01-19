// Mock for @react-native-google-signin/google-signin
export const GoogleSignin = {
  hasPlayServices: jest.fn(() => Promise.resolve(true)),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getTokens: jest.fn(),
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
};
