import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
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

export type PaymentMethod = 'cash_on_delivery' | 'card_payment';

export type PaymentMethodDetails = {
  method: PaymentMethod;
  cardId?: string; // If card_payment, the ID of the selected card
};

export type OrderTimelineEntry = {
  status: OrderStatus;
  timestamp: any;
  note?: string;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentCardId?: string; // If card_payment, the ID of the card used
  createdAt: any;
  updatedAt: any;
  timeline?: OrderTimelineEntry[]; // Status change history
  viewedByAdmin?: boolean; // Admin has viewed this order
  viewedAt?: any; // When admin viewed the order
  cancellationRequested?: boolean; // User has requested cancellation
  cancellationRequestedAt?: any; // When cancellation was requested
  cancellationReason?: string; // Reason for cancellation
  cancellationRejected?: boolean; // Admin rejected the cancellation
  cancellationRejectedAt?: any; // When cancellation was rejected
  cancellationRejectionReason?: string; // Reason for rejection
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
  opts?: { shipping?: number; address?: OrderAddress; paymentMethod?: PaymentMethod; paymentCardId?: string },
): Promise<{ orderId: string }> {
  const uid = requireUid();
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  if (!opts?.address) {
    throw new Error('Delivery address is required');
  }

  if (!opts?.paymentMethod) {
    throw new Error('Payment method is required');
  }

  if (opts.paymentMethod === 'card_payment' && !opts.paymentCardId) {
    throw new Error('Card selection is required for card payment');
  }

  const items = normalizeOrderItems(cartItems);
  const subtotal = calcSubtotal(items);
  const shipping = Math.max(0, Number(opts?.shipping ?? 0));
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + Number(i.quantity), 0);

  // IMPORTANT: Stock is ONLY deducted here when order is placed, NOT when items are added to cart
  // This ensures stock is reserved only when user commits to purchase
  // Use a transaction to atomically:
  // 1. Check and DEDUCT product stock (this is where stock is actually reduced)
  // 2. Create order
  // 3. Clear cart
  const orderId = await runTransaction(firebaseDb, async (transaction) => {
    // Step 1: Check stock availability and prepare stock DEDUCTIONS
    const productUpdates: Array<{ productId: string; newStock: number; productName: string }> = [];
    const productRefs = items.map((item) => doc(firebaseDb, 'products', item.productId));
    
    // Read all product documents
    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref))
    );

    // Validate stock for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const productSnap = productSnaps[i];
      
      if (!productSnap.exists()) {
        throw new Error(`Product ${item.name} (ID: ${item.productId}) not found`);
      }

      const productData = productSnap.data();
      const currentStock = Number(productData?.stock ?? 0);
      const orderedQuantity = Number(item.quantity ?? 0);

      if (orderedQuantity <= 0) {
        throw new Error(`Invalid quantity for ${item.name}`);
      }

      if (currentStock < orderedQuantity) {
        throw new Error(
          `Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${orderedQuantity}`
        );
      }

      // Calculate new stock after deduction
      const newStock = currentStock - orderedQuantity;

      // Double-check: Ensure stock never goes negative (defensive programming)
      if (newStock < 0) {
        throw new Error(
          `Stock calculation error for ${item.name}. Current: ${currentStock}, Requested: ${orderedQuantity}`,
        );
      }

      productUpdates.push({
        productId: item.productId,
        newStock,
        productName: item.name,
      });
    }

    // Step 2: DEDUCT stock from all products atomically
    // THIS IS WHERE STOCK IS ACTUALLY REDUCED - not when adding to cart
    // This ensures stock is deducted correctly and prevents race conditions
    // Firestore will automatically notify all active onSnapshot listeners (real-time subscriptions)
    // when this transaction commits, so ProductDetailsScreen and CartScreen will update immediately
    productUpdates.forEach((update) => {
      const productRef = doc(firebaseDb, 'products', update.productId);
      // Stock is deducted here - this update triggers real-time listeners
      transaction.update(productRef, {
        stock: update.newStock, // Reduced stock value
        updatedAt: serverTimestamp(),
      });
    });

    // Step 3: Create order document with initial timeline entry
    // Use Date object for timeline entries (Firestore converts it to Timestamp)
    // serverTimestamp() doesn't work inside arrays
    const initialTimeline: OrderTimelineEntry[] = [
      {
        status: 'processing',
        timestamp: new Date(),
        note: 'Order placed',
      },
    ];

    const orderRef = doc(ordersCollectionRef(uid));
    transaction.set(orderRef, {
      userId: uid,
      status: 'processing',
      paymentMethod: opts.paymentMethod,
      paymentCardId: opts.paymentCardId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: initialTimeline,
      viewedByAdmin: false, // New orders are unread by admin
      items,
      itemCount,
      subtotal,
      shipping,
      total,
      address: opts.address,
    } as Omit<Order, 'id'>);

    // Step 4: Clear cart documents
    cartItems.forEach((cartItem) => {
      const cartRef = doc(firebaseDb, 'users', uid, 'cart', cartItem.id);
      transaction.delete(cartRef);
    });

    return orderRef.id;
  });

  // After transaction commits successfully:
  // 1. Stock has been DEDUCTED from all products (this is the ONLY place stock is reduced)
  // 2. Order has been created
  // 3. Cart has been cleared
  // 4. All active Firestore listeners (onSnapshot) will automatically receive updates in real-time:
  //    - ProductDetailsScreen will show updated stock immediately via subscribeProductById
  //    - CartScreen will reflect cleared cart immediately via subscribeCart
  //    - Any other screens with product subscriptions will update automatically
  // No manual refresh needed - all updates happen in real-time at runtime
  return { orderId };
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

/**
 * Get a single order by ID for the current user
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const uid = requireUid();
  const orderRef = doc(firebaseDb, 'users', uid, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    return null;
  }
  
  return {
    id: orderSnap.id,
    ...(orderSnap.data() as any),
  } as Order;
}

/**
 * Subscribe to a single order by ID for real-time updates (for current user)
 */
export function subscribeOrderById(
  orderId: string,
  onOrder: (order: Order | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  const orderRef = doc(firebaseDb, 'users', uid, 'orders', orderId);
  
  return onSnapshot(
    orderRef,
    (snap) => {
      if (!snap.exists()) {
        onOrder(null);
        return;
      }
      
      const order = {
        id: snap.id,
        ...(snap.data() as any),
      } as Order;
      onOrder(order);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Get a single order by ID and userId (for admin use)
 */
export async function getOrderByIdForAdmin(orderId: string, userId: string): Promise<Order | null> {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    return null;
  }
  
  return {
    id: orderSnap.id,
    ...(orderSnap.data() as any),
  } as Order;
}

/**
 * Request order cancellation (user only)
 */
export async function requestOrderCancellation(orderId: string, reason?: string): Promise<void> {
  const uid = requireUid();
  const orderRef = doc(firebaseDb, 'users', uid, 'orders', orderId);
  
  // Verify order exists and belongs to user
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }
  
  const orderData = orderSnap.data() as any;
  
  // Can only cancel orders that are not already cancelled or delivered
  if (orderData.status === 'cancelled') {
    throw new Error('Order is already cancelled');
  }
  
  if (orderData.status === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }
  
  if (orderData.cancellationRequested === true) {
    throw new Error('Cancellation already requested for this order');
  }
  
  await updateDoc(orderRef, {
    cancellationRequested: true,
    cancellationRequestedAt: serverTimestamp(),
    cancellationReason: reason || 'No reason provided',
    cancellationRejected: false, // Reset rejection if previously rejected
    cancellationRejectedAt: null,
    cancellationRejectionReason: null,
    updatedAt: serverTimestamp(),
  });
}


