import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

export const firebaseApp = getApp();
export const firebaseAuth = auth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
