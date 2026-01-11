import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover';

export type SavedCard = {
  id: string;
  userId: string;
  cardType: CardType;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName?: string;
  isDefault: boolean;
  createdAt: any;
  updatedAt: any;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

function paymentMethodsCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'paymentMethods');
}

/**
 * Subscribe to user's saved payment methods (cards)
 */
export function subscribePaymentMethods(
  onMethods: (methods: SavedCard[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  const q = query(
    paymentMethodsCollectionRef(uid),
    orderBy('isDefault', 'desc'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => {
      const methods = snap.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as any),
      })) as SavedCard[];
      onMethods(methods);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Get default payment method (card)
 */
export async function getDefaultPaymentMethod(): Promise<SavedCard | null> {
  const uid = requireUid();
  const q = query(
    paymentMethodsCollectionRef(uid),
    where('isDefault', '==', true),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }
  return {
    id: snap.docs[0].id,
    ...(snap.docs[0].data() as any),
  } as SavedCard;
}

/**
 * Add a new payment method (card)
 */
export async function addPaymentMethod(
  card: Omit<SavedCard, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const uid = requireUid();

  // If this is set as default, unset all other defaults
  if (card.isDefault) {
    const existingDefault = await getDefaultPaymentMethod();
    if (existingDefault) {
      const existingRef = doc(firebaseDb, 'users', uid, 'paymentMethods', existingDefault.id);
      await updateDoc(existingRef, {
        isDefault: false,
        updatedAt: serverTimestamp(),
      });
    }
  }

  const ref = doc(paymentMethodsCollectionRef(uid));
  await setDoc(ref, {
    userId: uid,
    ...card,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as Omit<SavedCard, 'id'>);

  return ref.id;
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(cardId: string): Promise<void> {
  const uid = requireUid();

  // Unset all other defaults
  const allMethods = await getDocs(paymentMethodsCollectionRef(uid));
  const batch = allMethods.docs
    .filter((d: any) => d.id !== cardId)
    .map((d: any) =>
      updateDoc(doc(firebaseDb, 'users', uid, 'paymentMethods', d.id), {
        isDefault: false,
        updatedAt: serverTimestamp(),
      }),
    );

  await Promise.all(batch);

  // Set this one as default
  const ref = doc(firebaseDb, 'users', uid, 'paymentMethods', cardId);
  await updateDoc(ref, {
    isDefault: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(cardId: string): Promise<void> {
  const uid = requireUid();
  const ref = doc(firebaseDb, 'users', uid, 'paymentMethods', cardId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Payment method not found');
  }
  
  const cardData = snap.data() as any;
  
  // Check if this is the default payment method
  if (cardData?.isDefault === true) {
    // Check if there are other payment methods available
    const allMethods = await getDocs(paymentMethodsCollectionRef(uid));
    const otherMethods = allMethods.docs.filter((d: any) => d.id !== cardId);
    
    if (otherMethods.length === 0) {
      throw new Error('Cannot delete the default payment method. Please add another payment method first.');
    }
    
    // If there are other methods, we'll set the first one as default before deletion
    const newDefaultRef = doc(firebaseDb, 'users', uid, 'paymentMethods', otherMethods[0].id);
    await updateDoc(newDefaultRef, {
      isDefault: true,
      updatedAt: serverTimestamp(),
    });
  }
  
  // For now, we'll do a hard delete
  const { deleteDoc } = await import('@react-native-firebase/firestore');
  await deleteDoc(ref);
}
