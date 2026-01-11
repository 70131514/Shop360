import {
  collection,
  deleteDoc,
  doc,
  getDoc,
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
import { getProductById } from './productCatalogService';

export type CartItem = {
  id: string; // productId
  name: string;
  price: number; // unit price
  image?: string;
  quantity: number;
  brand?: string;
  originalPrice?: number;
  inStock?: boolean;
  stock?: number; // Current stock from product
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
  const user = firebaseAuth.currentUser;
  // Only return uid if user is authenticated and email is verified
  // This ensures authenticated users always use Firestore, not local storage
  if (user?.uid && user.emailVerified) {
    return user.uid;
  }
  return null;
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

  // Check stock before adding
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  if (product.stock <= 0) {
    throw new Error('Product is out of stock');
  }

  const next = [...items];
  const idx = next.findIndex((i) => i.id === productId);
  const now = Date.now();

  if (idx >= 0) {
    const existing = next[idx];
    const newQuantity = Number(existing.quantity ?? 1) + qtyToAdd;
    if (newQuantity > product.stock) {
      throw new Error(`Only ${product.stock} item(s) available in stock`);
    }
    next[idx] = {
      ...existing,
      // keep latest product info
      name: item.name,
      price: item.price,
      image: item.image ?? existing.image,
      brand: item.brand ?? existing.brand,
      originalPrice: item.originalPrice ?? existing.originalPrice,
      inStock: product.stock > 0,
      stock: product.stock,
      quantity: newQuantity,
      updatedAt: now,
    };
  } else {
    if (qtyToAdd > product.stock) {
      throw new Error(`Only ${product.stock} item(s) available in stock`);
    }
    next.unshift({
      ...item,
      id: productId,
      quantity: qtyToAdd,
      stock: product.stock,
      inStock: product.stock > 0,
      addedAt: now,
      updatedAt: now,
    } as CartItem);
  }

  await storeGuestCart(next);
  await notifyGuestCartListeners();
}

async function guestSetCartItemQuantity(productId: string, quantity: number) {
  const q = Math.floor(Number(quantity));
  
  // Check stock before setting quantity
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  if (q > 0 && q > product.stock) {
    throw new Error(`Only ${product.stock} item(s) available in stock`);
  }

  const items = ((await getGuestCart()) as CartItem[]) ?? [];
  const next =
    q <= 0
      ? items.filter((i) => i.id !== productId)
      : items.map((i) =>
          i.id === productId
            ? {
                ...i,
                quantity: q,
                stock: product.stock,
                inStock: product.stock > 0,
                updatedAt: Date.now(),
              }
            : i,
        );
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
  const user = firebaseAuth.currentUser;
  // Only use local storage for truly unauthenticated users (guests)
  if (!user?.uid || !user.emailVerified) {
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

  // Authenticated user - always use Firestore (never local storage)
  const uid = user.uid;
  const q = query(cartCollectionRef(uid), orderBy('updatedAt', 'desc'));
  let productUnsubs: Map<string, () => void> = new Map();
  let currentItems: CartItem[] = [];

  const updateItemsWithStock = async (items: CartItem[]) => {
    currentItems = items;
    const enrichedItems: CartItem[] = [];

    // Clean up old subscriptions for items no longer in cart
    const currentProductIds = new Set(items.map((i) => i.id));
    for (const [productId, unsub] of productUnsubs.entries()) {
      if (!currentProductIds.has(productId)) {
        unsub();
        productUnsubs.delete(productId);
      }
    }

    // Subscribe to products and get initial stock
    for (const item of items) {
      if (!productUnsubs.has(item.id)) {
        const productRef = doc(firebaseDb, 'products', item.id);
        
        // Get initial stock
        try {
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const productData = productSnap.data();
            enrichedItems.push({
              ...item,
              stock: Number(productData?.stock ?? 0),
              inStock: Number(productData?.stock ?? 0) > 0,
            });
          } else {
            enrichedItems.push({
              ...item,
              stock: 0,
              inStock: false,
            });
          }
        } catch {
          enrichedItems.push(item);
        }

        // Subscribe to product changes
        const productUnsub = onSnapshot(
          productRef,
          (productSnap) => {
            const updatedItems = currentItems.map((i) => {
              if (i.id !== item.id) {
                return i;
              }

              if (!productSnap.exists()) {
                // Product deleted
                return {
                  ...i,
                  stock: 0,
                  inStock: false,
                };
              }

              const productData = productSnap.data();
              const currentStock = Number(productData?.stock ?? 0);
              return {
                ...i,
                stock: currentStock,
                inStock: currentStock > 0,
                // Update price and name if changed
                price: Number(productData?.price ?? i.price),
                name: String(productData?.title ?? i.name),
              };
            });
            currentItems = updatedItems;
            onItems(updatedItems);
          },
          (err) => {
            console.warn(`Error subscribing to product ${item.id} stock:`, err);
          },
        );
        productUnsubs.set(item.id, productUnsub);
      } else {
        enrichedItems.push(item);
      }
    }

    onItems(enrichedItems);
  };

  const unsubCart = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
        } as CartItem;
      });
      updateItemsWithStock(items);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );

  return () => {
    unsubCart();
    productUnsubs.forEach((unsub) => unsub());
    productUnsubs.clear();
  };
}

export async function addToCart(
  item: Omit<CartItem, 'quantity'> & { quantity?: number },
): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Ensure authenticated users always use Firestore
  if (user?.uid) {
    if (!user.emailVerified) {
      throw new Error('Please verify your email to add items to cart.');
    }
    // Authenticated user - use Firestore (never local storage)
    const uid = user.uid;
  const productId = item.id;
  const qtyToAdd = Math.max(1, Number(item.quantity ?? 1));
  const ref = cartDocRef(uid, productId);
  const productRef = doc(firebaseDb, 'products', productId);

  await runTransaction(firebaseDb, async (tx) => {
    // Get current product stock
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }
    const productData = productSnap.data();
    const currentStock = Number(productData?.stock ?? 0);
    
    if (currentStock <= 0) {
      throw new Error('Product is out of stock');
    }

    const cartSnap = await tx.get(ref);
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const currentQuantity = Number(cartData?.quantity ?? 0);
      const newQuantity = currentQuantity + qtyToAdd;
      
      if (newQuantity > currentStock) {
        throw new Error(`Only ${currentStock} item(s) available in stock`);
      }

      tx.update(ref, {
        // keep latest product info in case it changes
        name: item.name,
        price: item.price,
        image: item.image ?? null,
        brand: item.brand ?? null,
        originalPrice: item.originalPrice ?? null,
        inStock: currentStock > 0,
        stock: currentStock,
        quantity: increment(qtyToAdd),
        updatedAt: serverTimestamp(),
      } as any);
    } else {
      if (qtyToAdd > currentStock) {
        throw new Error(`Only ${currentStock} item(s) available in stock`);
      }

      tx.set(
        ref,
        {
          ...item,
          id: productId,
          quantity: qtyToAdd,
          stock: currentStock,
          inStock: currentStock > 0,
          addedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  });
    return;
  }
  
  // Only use local storage for truly unauthenticated users (guests)
  await guestAddToCart(item);
}

export async function setCartItemQuantity(productId: string, quantity: number): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Ensure authenticated users always use Firestore
  if (user?.uid) {
    if (!user.emailVerified) {
      throw new Error('Please verify your email to update cart.');
    }
    // Authenticated user - use Firestore (never local storage)
    const uid = user.uid;
  const q = Math.floor(Number(quantity));
  if (q <= 0) {
    await deleteDoc(cartDocRef(uid, productId));
    return;
  }

  const ref = cartDocRef(uid, productId);
  const productRef = doc(firebaseDb, 'products', productId);

  await runTransaction(firebaseDb, async (tx) => {
    // Check stock
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }
    const productData = productSnap.data();
    const currentStock = Number(productData?.stock ?? 0);
    
    if (q > currentStock) {
      throw new Error(`Only ${currentStock} item(s) available in stock`);
    }

    // Update quantity
    tx.update(ref, {
      quantity: q,
      stock: currentStock,
      inStock: currentStock > 0,
      updatedAt: serverTimestamp(),
    } as any);
  });
    return;
  }
  
  // Only use local storage for truly unauthenticated users (guests)
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  const q = Math.floor(Number(quantity));
  if (q > product.stock) {
    throw new Error(`Only ${product.stock} item(s) available in stock`);
  }
  await guestSetCartItemQuantity(productId, quantity);
}

export async function removeFromCart(productId: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Ensure authenticated users always use Firestore
  if (user?.uid) {
    if (!user.emailVerified) {
      throw new Error('Please verify your email to remove items from cart.');
    }
    // Authenticated user - use Firestore (never local storage)
    await deleteDoc(cartDocRef(user.uid, productId));
    return;
  }
  
  // Only use local storage for truly unauthenticated users (guests)
  await guestRemoveFromCart(productId);
}

export async function clearCart(): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Ensure authenticated users always use Firestore
  if (user?.uid) {
    if (!user.emailVerified) {
      throw new Error('Please verify your email to clear cart.');
    }
    // Authenticated user - use Firestore (never local storage)
    const snap = await getDocs(cartCollectionRef(user.uid));
    const batch = writeBatch(firebaseDb);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return;
  }
  
  // Only use local storage for truly unauthenticated users (guests)
  await guestClearCart();
}

/**
 * Convenience helper to "upsert" a cart item without incrementing.
 * Useful for "Move to cart" flows.
 */
export async function upsertCartItem(item: CartItem): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Ensure authenticated users always use Firestore
  if (user?.uid) {
    if (!user.emailVerified) {
      throw new Error('Please verify your email to update cart.');
    }
    // Authenticated user - use Firestore (never local storage)
    const productId = item.id;
    await setDoc(
      cartDocRef(user.uid, productId),
    {
      ...item,
      id: productId,
      quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
      updatedAt: serverTimestamp(),
      addedAt: item.addedAt ?? serverTimestamp(),
    },
    { merge: true },
  );
    return;
  }
  
  // Only use local storage for truly unauthenticated users (guests)
  await guestSetCartItemQuantity(item.id, item.quantity);
}

/**
 * Move guest cart items into the signed-in user's Firestore cart.
 * This lets the cart persist across guest -> login transitions.
 */
export async function migrateGuestCartToUserCart(): Promise<void> {
  const user = firebaseAuth.currentUser;
  // Only migrate if user is authenticated and email verified
  if (!user?.uid || !user.emailVerified) {
    return;
  }
  
  const guestItems = ((await getGuestCart()) as CartItem[]) ?? [];
  if (guestItems.length === 0) {
    return;
  }

  // Merge quantities into Firestore cart (increment semantics are fine)
  // This ensures guest cart items are moved to Firestore, not kept locally
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

  // Clear local storage after migration
  await storeGuestCart([]);
  await notifyGuestCartListeners();
}
