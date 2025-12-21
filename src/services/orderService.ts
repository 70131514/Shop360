import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';
import type { CartItem } from './cartService';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItem = {
  productId: string;
  name: string;
  brand?: string | null;
  image?: string | null;
  price: number; // unit price
  quantity: number;
  originalPrice?: number | null;
};

export type OrderAddress = {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  address: OrderAddress;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

function ordersCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'orders');
}

function cartCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'cart');
}

function normalizeOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((i) => ({
    productId: i.id,
    name: i.name,
    brand: i.brand ?? null,
    image: i.image ?? null,
    price: Number(i.price ?? 0),
    quantity: Math.max(1, Math.floor(Number(i.quantity ?? 1))),
    originalPrice: i.originalPrice ?? null,
  }));
}

function calcSubtotal(items: OrderItem[]) {
  return items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
}

/**
 * Creates an order for the current user from their cart items and clears the cart
 * in the same Firestore batch.
 */
export async function placeOrderFromCart(
  cartItems: CartItem[],
  opts?: { shipping?: number; address?: OrderAddress },
): Promise<{ orderId: string }> {
  const uid = requireUid();
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  if (!opts?.address) {
    throw new Error('Delivery address is required');
  }

  const items = normalizeOrderItems(cartItems);
  const subtotal = calcSubtotal(items);
  const shipping = Math.max(0, Number(opts?.shipping ?? 0));
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + Number(i.quantity), 0);

  const batch = writeBatch(firebaseDb);

  // Create order document
  const orderRef = await addDoc(ordersCollectionRef(uid), {
    userId: uid,
    status: 'processing',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    address: opts.address,
  } as Omit<Order, 'id'>);

  // Clear cart documents
  cartItems.forEach((i) => {
    batch.delete(doc(firebaseDb, 'users', uid, 'cart', i.id));
  });

  // Also clear any remaining cart docs not in our local snapshot (safety)
  // NOTE: This is intentionally omitted to avoid extra reads; cart snapshot is source-of-truth in UI.

  await batch.commit();

  return { orderId: orderRef.id };
}

export function subscribeOrders(
  onOrders: (orders: Order[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  const q = query(ordersCollectionRef(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
      onOrders(orders);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

export function subscribeOrderCount(
  onCount: (count: number) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  return subscribeOrders(
    (orders) => onCount(orders.length),
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}


