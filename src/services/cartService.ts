import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type CartItem = {
  id: string; // productId
  name: string;
  price: number; // unit price
  image?: string;
  quantity: number;
  brand?: string;
  originalPrice?: number;
  inStock?: boolean;
  addedAt?: any;
  updatedAt?: any;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

function cartCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'cart');
}

function cartDocRef(uid: string, productId: string) {
  return doc(firebaseDb, 'users', uid, 'cart', productId);
}

export function subscribeCart(
  onItems: (items: CartItem[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  const q = query(cartCollectionRef(uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
        } as CartItem;
      });
      onItems(items);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

export async function addToCart(
  item: Omit<CartItem, 'quantity'> & { quantity?: number },
): Promise<void> {
  const uid = requireUid();
  const productId = item.id;
  const qtyToAdd = Math.max(1, Number(item.quantity ?? 1));
  const ref = cartDocRef(uid, productId);

  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      tx.update(ref, {
        // keep latest product info in case it changes
        name: item.name,
        price: item.price,
        image: item.image ?? null,
        brand: item.brand ?? null,
        originalPrice: item.originalPrice ?? null,
        inStock: item.inStock ?? null,
        quantity: increment(qtyToAdd),
        updatedAt: serverTimestamp(),
      } as any);
    } else {
      tx.set(
        ref,
        {
          ...item,
          id: productId,
          quantity: qtyToAdd,
          addedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  });
}

export async function setCartItemQuantity(productId: string, quantity: number): Promise<void> {
  const uid = requireUid();
  const q = Math.floor(Number(quantity));
  if (q <= 0) {
    await deleteDoc(cartDocRef(uid, productId));
    return;
  }
  await updateDoc(cartDocRef(uid, productId), {
    quantity: q,
    updatedAt: serverTimestamp(),
  } as any);
}

export async function removeFromCart(productId: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(cartDocRef(uid, productId));
}

export async function clearCart(): Promise<void> {
  const uid = requireUid();
  const snap = await getDocs(cartCollectionRef(uid));
  const batch = writeBatch(firebaseDb);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/**
 * Convenience helper to "upsert" a cart item without incrementing.
 * Useful for "Move to cart" flows.
 */
export async function upsertCartItem(item: CartItem): Promise<void> {
  const uid = requireUid();
  const productId = item.id;
  await setDoc(
    cartDocRef(uid, productId),
    {
      ...item,
      id: productId,
      quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
      updatedAt: serverTimestamp(),
      addedAt: item.addedAt ?? serverTimestamp(),
    },
    { merge: true },
  );
}
