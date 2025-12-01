/**
 * Firebase Configuration for Shop360
 * 
 * React Native Firebase automatically reads from:
 * - android/app/google-services.json (Android)
 * - ios/GoogleService-Info.plist (iOS)
 * 
 * This file provides the web SDK config for any web-based Firebase usage
 */

import {initializeApp} from 'firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Web SDK Firebase Configuration (from google-services.json)
const firebaseConfig = {
  apiKey: 'AIzaSyDqr9YDs7UcDx6rjbgjH-qceF6EXDFBVBU',
  projectId: 'shop360-7bfcd',
  storageBucket: 'shop360-7bfcd.firebasestorage.app',
  appId: '1:294453693408:android:2b9a5faa06eb4ea971f985',
};

// Initialize Firebase Web SDK (if needed for web-based features)
export const firebaseApp = initializeApp(firebaseConfig);

// Export React Native Firebase services
// These automatically use the native configuration from google-services.json
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseStorage = storage();

// Default export for convenience
export default {
  auth: firebaseAuth,
  firestore: firebaseFirestore,
  storage: firebaseStorage,
  app: firebaseApp,
};
