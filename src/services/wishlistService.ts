import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type WishlistItem = {
  id: string; // productId
  name: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  inStock?: boolean;
  addedAt?: any;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

function wishlistCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'wishlist');
}

function wishlistDocRef(uid: string, productId: string) {
  return doc(firebaseDb, 'users', uid, 'wishlist', productId);
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const uid = requireUid();
  const q = query(wishlistCollectionRef(uid), orderBy('addedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      ...data,
    } as WishlistItem;
  });
}

export async function isWishlisted(productId: string): Promise<boolean> {
  const uid = requireUid();
  const snap = await getDoc(wishlistDocRef(uid, productId));
  return snap.exists();
}

export async function addToWishlist(item: WishlistItem): Promise<void> {
  const uid = requireUid();
  const productId = item.id;
  await setDoc(
    wishlistDocRef(uid, productId),
    {
      ...item,
      id: productId,
      addedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(wishlistDocRef(uid, productId));
}

export async function toggleWishlist(item: WishlistItem): Promise<boolean> {
  const exists = await isWishlisted(item.id);
  if (exists) {
    await removeFromWishlist(item.id);
    return false;
  }
  await addToWishlist(item);
  return true;
}
