import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseDb } from '../firebase';
import type { OrderStatus } from '../orderService';

export type AdminUserRow = {
  uid: string;
  name?: string;
  email?: string;
  role?: string;
};

export type AdminOrderRow = {
  id: string;
  shortId: string;
  userId: string;
  status: string;
  total: number;
  viewedByAdmin?: boolean;
  createdAt?: any;
};

export type AdminProductRow = {
  id: string;
  title: string;
  category: string;
  price: number;
};

export function subscribeAdminStats(
  onStats: (stats: { users: number; products: number; orders: number }) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  let users = 0;
  let products = 0;
  let orders = 0;

  const emit = () => onStats({ users, products, orders });

  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      query(collection(firebaseDb, 'users')),
      (snap) => {
        users = snap.size;
        emit();
      },
      onError,
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(firebaseDb, 'products')),
      (snap) => {
        products = snap.size;
        emit();
      },
      onError,
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collectionGroup(firebaseDb, 'orders')),
      (snap) => {
        orders = snap.size;
        emit();
      },
      onError,
    ),
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export function subscribeAllUsers(
  onUsers: (users: AdminUserRow[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'users'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          name: data?.name,
          email: data?.email,
          role: data?.role,
        } as AdminUserRow;
      });
      onUsers(rows);
    },
    onError,
  );
}

export function subscribeAllOrders(
  onOrders: (orders: AdminOrderRow[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collectionGroup(firebaseDb, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        const id = d.id;
        return {
          id,
          shortId: String(id).slice(-6).toUpperCase(),
          userId: data?.userId ?? '—',
          status: data?.status ?? 'processing',
          total: Number(data?.total ?? 0),
          viewedByAdmin: Boolean(data?.viewedByAdmin ?? false),
          createdAt: data?.createdAt,
        } as AdminOrderRow;
      });
      onOrders(rows);
    },
    onError,
  );
}

/**
 * Subscribe to count of new/unread orders (not viewed by admin)
 */
export function subscribeNewOrderCount(
  onCount: (count: number) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collectionGroup(firebaseDb, 'orders'));
  return onSnapshot(
    q,
    (snap) => {
      const unreadCount = snap.docs.filter((d) => {
        const data = d.data() as any;
        return !data?.viewedByAdmin;
      }).length;
      onCount(unreadCount);
    },
    onError,
  );
}

/**
 * Mark an order as viewed by admin
 */
export async function markOrderAsViewed(orderId: string, userId: string): Promise<void> {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
  await updateDoc(orderRef, {
    viewedByAdmin: true,
    viewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeAllProducts(
  onProducts: (products: AdminProductRow[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: String(data?.title ?? ''),
          category: String(data?.category ?? ''),
          price: Number(data?.price ?? 0),
        } as AdminProductRow;
      });
      onProducts(rows);
    },
    onError,
  );
}

export function subscribeRecentUsers(
  onUsers: (users: AdminUserRow[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'users'), orderBy('createdAt', 'desc'), limit(5));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          name: data?.name,
          email: data?.email,
          role: data?.role,
        } as AdminUserRow;
      });
      onUsers(rows);
    },
    onError,
  );
}

export function subscribeRecentOrders(
  onOrders: (orders: AdminOrderRow[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collectionGroup(firebaseDb, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        const id = d.id;
        return {
          id,
          shortId: String(id).slice(-6).toUpperCase(),
          userId: data?.userId ?? '—',
          status: data?.status ?? 'processing',
          total: Number(data?.total ?? 0),
        } as AdminOrderRow;
      });
      onOrders(rows);
    },
    onError,
  );
}

/**
 * Assign or update a user's role by email
 * If the user doesn't exist yet, creates a role assignment document
 * If the user exists, updates their role
 */
export async function assignRoleByEmail(email: string, role: string): Promise<void> {
  if (!email || !email.trim()) {
    throw new Error('Email is required');
  }
  if (!role || !role.trim()) {
    throw new Error('Role is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  // First, try to find existing user by email
  const usersQuery = query(collection(firebaseDb, 'users'), where('email', '==', normalizedEmail));
  const usersSnapshot = await getDocs(usersQuery);

  if (usersSnapshot.empty) {
    // User doesn't exist yet - create a role assignment document
    // This will be checked during signup
    await setDoc(doc(firebaseDb, 'roleAssignments', normalizedEmail), {
      email: normalizedEmail,
      role: normalizedRole,
      assignedAt: serverTimestamp(),
    });
  } else {
    // User exists - update their role
    const userDoc = usersSnapshot.docs[0];
    await updateDoc(doc(firebaseDb, 'users', userDoc.id), {
      role: normalizedRole,
    } as any);
  }
}

/**
 * Update a user's role by UID
 */
export async function updateUserRole(uid: string, role: string): Promise<void> {
  if (!uid || !uid.trim()) {
    throw new Error('User ID is required');
  }
  if (!role || !role.trim()) {
    throw new Error('Role is required');
  }

  const normalizedRole = role.trim().toLowerCase();
  await updateDoc(doc(firebaseDb, 'users', uid), {
    role: normalizedRole,
  } as any);
}

/**
 * Get role assignment for an email (for pre-assigned roles)
 */
export async function getRoleAssignmentByEmail(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const roleDoc = await getDocs(query(collection(firebaseDb, 'roleAssignments'), where('email', '==', normalizedEmail)));
  
  if (roleDoc.empty) {
    return null;
  }
  
  return roleDoc.docs[0].data().role || null;
}

/**
 * Get user details by UID (includes full profile data)
 */
export async function getUserByUid(uid: string): Promise<AdminUserRow & { createdAt?: any } | null> {
  const userDocRef = doc(firebaseDb, 'users', uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    return null;
  }

  const data = userDocSnap.data() as any;
  return {
    uid: userDocSnap.id,
    name: data?.name,
    email: data?.email,
    role: data?.role,
    createdAt: data?.createdAt,
  };
}

/**
 * Get addresses for a specific user (admin only)
 */
export async function getUserAddresses(uid: string): Promise<any[]> {
  const addressesQuery = query(
    collection(firebaseDb, 'users', uid, 'addresses'),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(addressesQuery);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}

/**
 * Get tickets for a specific user (admin only)
 * Note: Sorted in memory to avoid requiring a composite index
 */
export async function getUserTickets(userId: string): Promise<any[]> {
  const ticketsQuery = query(collection(firebaseDb, 'tickets'), where('userId', '==', userId));
  const snapshot = await getDocs(ticketsQuery);
  const tickets = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));

  // Sort by createdAt in descending order (newest first)
  return tickets.sort((a, b) => {
    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bTime - aTime; // Descending order
  });
}

/**
 * Get a single order by ID and userId (for admin use)
 */
export async function getOrderByIdForAdmin(orderId: string, userId: string): Promise<any | null> {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (!orderSnap.exists()) {
    return null;
  }
  
  return {
    id: orderSnap.id,
    ...(orderSnap.data() as any),
  };
}

/**
 * Update order status (admin only) with timeline tracking
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: OrderStatus,
  note?: string,
): Promise<void> {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
  
  // Get current order to append to timeline
  const orderSnap = await getDoc(orderRef);
  const currentData = orderSnap.data();
  const currentTimeline = (currentData?.timeline as any[]) || [];
  
  // Add new timeline entry
  const newTimelineEntry = {
    status,
    timestamp: serverTimestamp(),
    note: note || `Status changed to ${status}`,
  };
  
  const updatedTimeline = [...currentTimeline, newTimelineEntry];
  
  await updateDoc(orderRef, {
    status,
    timeline: updatedTimeline,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Approve order cancellation (admin only) - restores stock and updates order status
 */
export async function approveOrderCancellation(
  orderId: string,
  userId: string,
  note?: string,
): Promise<void> {
  await runTransaction(firebaseDb, async (transaction) => {
    const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
    const orderSnap = await transaction.get(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderSnap.data() as any;
    
    if (orderData.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }
    
    if (!orderData.cancellationRequested) {
      throw new Error('No cancellation request found for this order');
    }
    
    const items = orderData.items || [];
    const currentTimeline = (orderData.timeline as any[]) || [];
    
    // Restore stock for all items
    for (const item of items) {
      const productRef = doc(firebaseDb, 'products', item.productId);
      const productSnap = await transaction.get(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentStock = Number(productData?.stock ?? 0);
        const quantityToRestore = Number(item.quantity ?? 0);
        const newStock = currentStock + quantityToRestore;
        
        transaction.update(productRef, {
          stock: newStock,
          updatedAt: serverTimestamp(),
        });
      }
    }
    
    // Update order status and timeline
    const newTimelineEntry = {
      status: 'cancelled' as OrderStatus,
      timestamp: serverTimestamp(),
      note: note || 'Order cancelled - stock restored',
    };
    
    const updatedTimeline = [...currentTimeline, newTimelineEntry];
    
    transaction.update(orderRef, {
      status: 'cancelled',
      timeline: updatedTimeline,
      cancellationRequested: false, // Clear request flag
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Reject order cancellation (admin only)
 */
export async function rejectOrderCancellation(
  orderId: string,
  userId: string,
  rejectionReason?: string,
): Promise<void> {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);
  
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }
  
  const orderData = orderSnap.data() as any;
  
  if (!orderData.cancellationRequested) {
    throw new Error('No cancellation request found for this order');
  }
  
  await updateDoc(orderRef, {
    cancellationRequested: false,
    cancellationRejected: true,
    cancellationRejectedAt: serverTimestamp(),
    cancellationRejectionReason: rejectionReason || 'Cancellation request rejected',
    updatedAt: serverTimestamp(),
  });
}

