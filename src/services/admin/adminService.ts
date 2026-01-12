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
      const rows = snap.docs.map((d: any) => {
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
  // Remove orderBy to avoid requiring a composite index
  // We'll sort in memory instead
  const q = query(collectionGroup(firebaseDb, 'orders'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d: any) => {
        const data = d.data() as any;
        const id = d.id;
        // Ensure status is properly read from Firestore
        const status = String(data?.status ?? 'processing').toLowerCase();
        return {
          id,
          shortId: String(id).slice(-6).toUpperCase(),
          userId: data?.userId ?? '—',
          status: status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
          total: Number(data?.total ?? 0),
          viewedByAdmin: Boolean(data?.viewedByAdmin ?? false),
          createdAt: data?.createdAt,
        } as AdminOrderRow;
      });

      // Sort in memory by createdAt (newest first)
      rows.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bTime = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return bTime - aTime; // Descending order (newest first)
      });

      // Always call onOrders with the latest data to ensure real-time updates
      onOrders(rows);
    },
    (err) => {
      console.error('Error in subscribeAllOrders:', err);
      if (onError) {
        onError(err);
      }
    },
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
      const unreadCount = snap.docs.filter((d: any) => {
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
      const rows = snap.docs.map((d: any) => {
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
      const rows = snap.docs.map((d: any) => {
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
  // Remove orderBy to avoid requiring a composite index
  // We'll sort in memory and limit to 5
  const q = query(collectionGroup(firebaseDb, 'orders'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d: any) => {
        const data = d.data() as any;
        const id = d.id;
        return {
          id,
          shortId: String(id).slice(-6).toUpperCase(),
          userId: data?.userId ?? '—',
          status: data?.status ?? 'processing',
          total: Number(data?.total ?? 0),
          createdAt: data?.createdAt,
        } as AdminOrderRow;
      });

      // Sort in memory by createdAt (newest first) and limit to 5
      rows.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bTime = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return bTime - aTime; // Descending order (newest first)
      });

      // Limit to 5 most recent
      onOrders(rows.slice(0, 5));
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
  const emailTrimmed = String(email || '').trim();
  const roleTrimmed = String(role || '').trim();

  if (!emailTrimmed) {
    throw new Error('Email is required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) {
    throw new Error('Invalid email format');
  }

  if (!roleTrimmed) {
    throw new Error('Role is required');
  }

  const normalizedEmail = emailTrimmed.toLowerCase();
  const normalizedRole = roleTrimmed.toLowerCase();

  // Validate role value
  const validRoles = ['admin', 'user'];
  if (!validRoles.includes(normalizedRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

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
      updatedAt: serverTimestamp(),
    } as any);
  }
}

/**
 * Update a user's role by UID
 */
export async function updateUserRole(uid: string, role: string): Promise<void> {
  const uidTrimmed = String(uid || '').trim();
  const roleTrimmed = String(role || '').trim();

  if (!uidTrimmed) {
    throw new Error('User ID is required');
  }
  if (!roleTrimmed) {
    throw new Error('Role is required');
  }

  const normalizedRole = roleTrimmed.toLowerCase();

  // Validate role value
  const validRoles = ['admin', 'user'];
  if (!validRoles.includes(normalizedRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  // Verify user exists
  const userRef = doc(firebaseDb, 'users', uidTrimmed);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  await updateDoc(userRef, {
    role: normalizedRole,
    updatedAt: serverTimestamp(),
  } as any);
}

/**
 * Get role assignment for an email (for pre-assigned roles)
 */
export async function getRoleAssignmentByEmail(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const roleDoc = await getDocs(
    query(collection(firebaseDb, 'roleAssignments'), where('email', '==', normalizedEmail)),
  );

  if (roleDoc.empty) {
    return null;
  }

  return roleDoc.docs[0].data().role || null;
}

/**
 * Get user details by UID (includes full profile data)
 */
export async function getUserByUid(
  uid: string,
): Promise<(AdminUserRow & { createdAt?: any }) | null> {
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
  return snapshot.docs.map((d: any) => ({
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
  const tickets = snapshot.docs.map((d: any) => ({
    id: d.id,
    ...(d.data() as any),
  }));

  // Sort by createdAt in descending order (newest first)
  return tickets.sort((a: any, b: any) => {
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
 * Subscribe to a single order by ID and userId for real-time updates (for admin use)
 */
export function subscribeOrderByIdForAdmin(
  orderId: string,
  userId: string,
  onOrder: (order: any | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const orderRef = doc(firebaseDb, 'users', userId, 'orders', orderId);

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
      };
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
 * Update order status (admin only) with timeline tracking and status transition validation
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: OrderStatus,
  note?: string,
): Promise<void> {
  const orderIdTrimmed = String(orderId || '').trim();
  const userIdTrimmed = String(userId || '').trim();

  if (!orderIdTrimmed) {
    throw new Error('Order ID is required');
  }
  if (!userIdTrimmed) {
    throw new Error('User ID is required');
  }

  // Validate status value
  const validStatuses: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid order status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const orderRef = doc(firebaseDb, 'users', userIdTrimmed, 'orders', orderIdTrimmed);

  // Get current order to validate status transition and append to timeline
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  const currentData = orderSnap.data() as any;
  const currentStatus = currentData?.status as OrderStatus;
  const currentTimeline = (currentData?.timeline as any[]) || [];

  // Validate status transitions
  if (currentStatus === 'cancelled' && status !== 'cancelled') {
    throw new Error('Cannot change status of a cancelled order');
  }

  if (currentStatus === 'delivered' && status !== 'delivered') {
    throw new Error('Cannot change status of a delivered order');
  }

  if (currentStatus === status) {
    // Status is the same, but we still update the timeline with a note if provided
    if (note) {
      // Use client-side timestamp for array entry (Firestore doesn't support serverTimestamp in arrays)
      const newTimelineEntry = {
        status,
        timestamp: new Date(),
        note,
      };
      const updatedTimeline = [...currentTimeline, newTimelineEntry];
      await updateDoc(orderRef, {
        timeline: updatedTimeline,
        updatedAt: serverTimestamp(),
      });
    }
    return; // No change needed
  }

  // Add new timeline entry
  // Use client-side timestamp for array entry (Firestore doesn't support serverTimestamp in arrays)
  const newTimelineEntry = {
    status,
    timestamp: new Date(),
    note: note || `Status changed from ${currentStatus} to ${status}`,
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
  const orderIdTrimmed = String(orderId || '').trim();
  const userIdTrimmed = String(userId || '').trim();

  if (!orderIdTrimmed) {
    throw new Error('Order ID is required');
  }
  if (!userIdTrimmed) {
    throw new Error('User ID is required');
  }

  await runTransaction(firebaseDb, async (transaction) => {
    const orderRef = doc(firebaseDb, 'users', userIdTrimmed, 'orders', orderIdTrimmed);
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
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Order has no items to process');
    }

    const currentTimeline = (orderData.timeline as any[]) || [];

    // Restore stock for all items
    for (const item of items) {
      if (!item.productId) {
        console.warn('Order item missing productId, skipping stock restoration');
        continue;
      }

      const productRef = doc(firebaseDb, 'products', item.productId);
      const productSnap = await transaction.get(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentStock = Number(productData?.stock ?? 0);
        const quantityToRestore = Number(item.quantity ?? 0);

        if (quantityToRestore <= 0) {
          console.warn(`Invalid quantity to restore for product ${item.productId}, skipping`);
          continue;
        }

        const newStock = currentStock + quantityToRestore;

        // Ensure stock doesn't exceed reasonable limits (defensive check)
        if (newStock > 1000000) {
          console.warn(
            `Stock restoration would exceed limit for product ${item.productId}, capping at 1,000,000`,
          );
          transaction.update(productRef, {
            stock: 1000000,
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.update(productRef, {
            stock: newStock,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        console.warn(`Product ${item.productId} not found, cannot restore stock`);
      }
    }

    // Update order status and timeline
    // Use client-side timestamp for array entry (Firestore doesn't support serverTimestamp in arrays)
    const newTimelineEntry = {
      status: 'cancelled' as OrderStatus,
      timestamp: new Date(),
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
 * Reject order cancellation (admin only) - uses transaction for consistency
 */
export async function rejectOrderCancellation(
  orderId: string,
  userId: string,
  rejectionReason?: string,
): Promise<void> {
  const orderIdTrimmed = String(orderId || '').trim();
  const userIdTrimmed = String(userId || '').trim();

  if (!orderIdTrimmed) {
    throw new Error('Order ID is required');
  }
  if (!userIdTrimmed) {
    throw new Error('User ID is required');
  }

  await runTransaction(firebaseDb, async (transaction) => {
    const orderRef = doc(firebaseDb, 'users', userIdTrimmed, 'orders', orderIdTrimmed);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderSnap.data() as any;

    if (!orderData.cancellationRequested) {
      throw new Error('No cancellation request found for this order');
    }

    if (orderData.status === 'cancelled') {
      throw new Error('Cannot reject cancellation for an already cancelled order');
    }

    const currentTimeline = (orderData.timeline as any[]) || [];
    // Use Date object for timeline entries (Firestore converts it to Timestamp)
    // serverTimestamp() doesn't work inside arrays
    const newTimelineEntry = {
      status: orderData.status,
      timestamp: new Date(),
      note: `Cancellation request rejected: ${rejectionReason || 'No reason provided'}`,
    };
    const updatedTimeline = [...currentTimeline, newTimelineEntry];

    transaction.update(orderRef, {
      cancellationRequested: false,
      cancellationRejected: true,
      cancellationRejectedAt: serverTimestamp(),
      cancellationRejectionReason: rejectionReason || 'Cancellation request rejected',
      timeline: updatedTimeline,
      updatedAt: serverTimestamp(),
    });
  });
}
