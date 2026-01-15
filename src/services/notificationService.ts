import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'product_removed' | 'order_update' | 'promotion' | 'general';
  read: boolean;
  createdAt: any;
  data?: {
    productId?: string;
    orderId?: string;
    [key: string]: any;
  };
};

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: Notification['type'];
  data?: Notification['data'];
}): Promise<string> {
  const { userId, title, message, type = 'general', data } = params;

  if (!userId || !title || !message) {
    throw new Error('userId, title, and message are required');
  }

  const notificationRef = doc(collection(firebaseDb, 'users', userId, 'notifications'));
  await setDoc(notificationRef, {
    title: String(title).trim(),
    message: String(message).trim(),
    type,
    read: false,
    data: data || {},
    createdAt: serverTimestamp(),
  });

  return notificationRef.id;
}

/**
 * Create notifications for multiple users in batch
 */
export async function createNotificationsForUsers(params: {
  userIds: string[];
  title: string;
  message: string;
  type?: Notification['type'];
  data?: Notification['data'];
}): Promise<void> {
  const { userIds, title, message, type = 'general', data } = params;

  if (!userIds || userIds.length === 0) {
    return;
  }

  // Create notifications in parallel (Firestore handles batching internally)
  const promises = userIds.map((userId) =>
    createNotification({
      userId,
      title,
      message,
      type,
      data,
    }).catch((error) => {
      // Log but don't fail the entire operation if one notification fails
      console.warn(`Failed to create notification for user ${userId}:`, error);
      return null;
    }),
  );

  await Promise.all(promises);
}

/**
 * Subscribe to notifications for the current user
 */
export function subscribeNotifications(
  onNotifications: (notifications: Notification[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    if (onError) {
      onError(new Error('User not authenticated'));
    }
    return () => {}; // Return no-op unsubscribe
  }

  // Check email verification - required by Firestore rules
  if (!user.emailVerified) {
    if (onError) {
      onError(new Error('Please verify your email to view notifications'));
    }
    return () => {}; // Return no-op unsubscribe
  }

  const notificationsRef = collection(firebaseDb, 'users', user.uid, 'notifications');
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: user.uid,
          title: data.title || '',
          message: data.message || '',
          type: (data.type || 'general') as Notification['type'],
          read: Boolean(data.read),
          createdAt: data.createdAt,
          data: data.data || {},
        } as Notification;
      });
      onNotifications(notifications);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Subscribe to unread notification count
 */
export function subscribeUnreadNotificationCount(
  onCount: (count: number) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    onCount(0);
    return () => {}; // Return no-op unsubscribe
  }

  // Check email verification - required by Firestore rules
  if (!user.emailVerified) {
    onCount(0);
    return () => {}; // Return no-op unsubscribe
  }

  const notificationsRef = collection(firebaseDb, 'users', user.uid, 'notifications');
  const q = query(notificationsRef, where('read', '==', false));

  return onSnapshot(
    q,
    (snapshot) => {
      onCount(snapshot.docs.length);
    },
    (err) => {
      if (onError) {
        onError(err);
      } else {
        onCount(0);
      }
    },
  );
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    throw new Error('User not authenticated');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email to manage notifications');
  }

  const notificationRef = doc(firebaseDb, 'users', user.uid, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    throw new Error('User not authenticated');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email to manage notifications');
  }

  const notificationsRef = collection(firebaseDb, 'users', user.uid, 'notifications');
  const q = query(notificationsRef, where('read', '==', false));
  const unreadSnapshot = await getDocs(q);

  if (unreadSnapshot.empty) {
    return; // No unread notifications
  }

  const batch = writeBatch(firebaseDb);
  unreadSnapshot.docs.forEach((docSnap: any) => {
    batch.update(docSnap.ref, { read: true });
  });

  await batch.commit();
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    throw new Error('User not authenticated');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email to manage notifications');
  }

  const notificationRef = doc(firebaseDb, 'users', user.uid, 'notifications', notificationId);
  await deleteDoc(notificationRef);
}
