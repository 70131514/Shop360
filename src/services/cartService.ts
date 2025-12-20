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
import { getCart as getGuestCart, storeCart as storeGuestCart } from '../utils/storage';

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

function getUidMaybe(): string | null {
  return firebaseAuth.currentUser?.uid ?? null;
}

function cartCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'cart');
}

function cartDocRef(uid: string, productId: string) {
  return doc(firebaseDb, 'users', uid, 'cart', productId);
}

// -------------------------
// Guest cart (AsyncStorage)
// -------------------------

type GuestListener = (items: CartItem[]) => void;
const guestListeners = new Set<GuestListener>();

async function notifyGuestCartListeners() {
  const items = (await getGuestCart()) as CartItem[];
  guestListeners.forEach((cb) => cb(items));
}

async function guestAddToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const items = ((await getGuestCart()) as CartItem[]) ?? [];
  const productId = item.id;
  const qtyToAdd = Math.max(1, Number(item.quantity ?? 1));

  const next = [...items];
  const idx = next.findIndex((i) => i.id === productId);
  const now = Date.now();

  if (idx >= 0) {
    const existing = next[idx];
    next[idx] = {
      ...existing,
      // keep latest product info
      name: item.name,
      price: item.price,
      image: item.image ?? existing.image,
      brand: item.brand ?? existing.brand,
      originalPrice: item.originalPrice ?? existing.originalPrice,
      inStock: item.inStock ?? existing.inStock,
      quantity: Math.max(1, Number(existing.quantity ?? 1) + qtyToAdd),
      updatedAt: now,
    };
  } else {
    next.unshift({
      ...item,
      id: productId,
      quantity: qtyToAdd,
      addedAt: now,
      updatedAt: now,
    } as CartItem);
  }

  await storeGuestCart(next);
  await notifyGuestCartListeners();
}

async function guestSetCartItemQuantity(productId: string, quantity: number) {
  const q = Math.floor(Number(quantity));
  const items = ((await getGuestCart()) as CartItem[]) ?? [];
  const next =
    q <= 0
      ? items.filter((i) => i.id !== productId)
      : items.map((i) => (i.id === productId ? { ...i, quantity: q, updatedAt: Date.now() } : i));
  await storeGuestCart(next);
  await notifyGuestCartListeners();
}

async function guestRemoveFromCart(productId: string) {
  const items = ((await getGuestCart()) as CartItem[]) ?? [];
  const next = items.filter((i) => i.id !== productId);
  await storeGuestCart(next);
  await notifyGuestCartListeners();
}

async function guestClearCart() {
  await storeGuestCart([]);
  await notifyGuestCartListeners();
}

export function subscribeCart(
  onItems: (items: CartItem[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = getUidMaybe();
  if (!uid) {
    let alive = true;
    // initial emit
    getGuestCart()
      .then((items) => {
        if (alive) {
          onItems((items as CartItem[]) ?? []);
        }
      })
      .catch((err) => {
        if (onError) {
          onError(err);
        }
      });

    const cb: GuestListener = (items) => {
      if (alive) {
        onItems(items);
      }
    };
    guestListeners.add(cb);
    return () => {
      alive = false;
      guestListeners.delete(cb);
    };
  }

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
  const uid = getUidMaybe();
  if (!uid) {
    await guestAddToCart(item);
    return;
  }
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
  const uid = getUidMaybe();
  if (!uid) {
    await guestSetCartItemQuantity(productId, quantity);
    return;
  }
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
  const uid = getUidMaybe();
  if (!uid) {
    await guestRemoveFromCart(productId);
    return;
  }
  await deleteDoc(cartDocRef(uid, productId));
}

export async function clearCart(): Promise<void> {
  const uid = getUidMaybe();
  if (!uid) {
    await guestClearCart();
    return;
  }
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
  const uid = getUidMaybe();
  if (!uid) {
    // upsert without increment
    await guestSetCartItemQuantity(item.id, item.quantity);
    return;
  }
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

/**
 * Move guest cart items into the signed-in user's Firestore cart.
 * This lets the cart persist across guest -> login transitions.
 */
export async function migrateGuestCartToUserCart(): Promise<void> {
  const uid = getUidMaybe();
  if (!uid) {
    return;
  }
  const guestItems = ((await getGuestCart()) as CartItem[]) ?? [];
  if (guestItems.length === 0) {
    return;
  }

  // Merge quantities into Firestore cart (increment semantics are fine)
  for (const item of guestItems) {
    await addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      brand: item.brand,
      originalPrice: item.originalPrice,
      inStock: item.inStock,
    });
  }

  await storeGuestCart([]);
  await notifyGuestCartListeners();
}
