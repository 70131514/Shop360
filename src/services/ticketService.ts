import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  where,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import {
  reload as reloadModular,
  getIdToken as getIdTokenModular,
} from '@react-native-firebase/auth';
import { firebaseAuth, firebaseDb } from './firebase';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type TicketTimelineEvent = {
  status: TicketStatus;
  timestamp: any;
};

export type Ticket = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  status: TicketStatus;
  createdAt: any;
  updatedAt: any;
  viewedByAdmin?: boolean;
  viewedAt?: any;
  timeline?: TicketTimelineEvent[];
};

/**
 * Submit a support ticket/inquiry
 */
export async function submitTicket(message: string): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error(
      'You must be signed in to submit a support ticket. Please sign in and verify your email address.',
    );
  }

  // Reload user to get latest email verification status and refresh ID token
  try {
    await reloadModular(user);
    // Refresh ID token so Firestore rules see the latest email verification status
    if (user.emailVerified) {
      await getIdTokenModular(user, true);
    }
  } catch (error) {
    console.warn('Failed to reload user:', error);
  }

  // Check email verification - guests and unverified users cannot submit tickets
  if (!user.emailVerified) {
    throw new Error(
      'Please verify your email address before submitting a support ticket. Check your inbox for the verification email.',
    );
  }

  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  const now = serverTimestamp();
  // Use regular Date for timeline since serverTimestamp() is not supported in arrays
  const timelineTimestamp = new Date();
  const ticketData = {
    userId: user.uid,
    userEmail: user.email || '',
    userName: user.displayName || 'User',
    message: message.trim(),
    status: 'open' as TicketStatus,
    createdAt: now,
    updatedAt: now,
    viewedByAdmin: false,
    timeline: [
      {
        status: 'open' as TicketStatus,
        timestamp: timelineTimestamp,
      },
    ],
  };

  const ticketRef = await addDoc(collection(firebaseDb, 'tickets'), ticketData);
  return ticketRef.id;
}

/**
 * Subscribe to all tickets (admin only)
 */
export function subscribeAllTickets(
  onTickets: (tickets: Ticket[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'tickets'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: Ticket[] = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as Omit<Ticket, 'id'>),
      }));
      onTickets(tickets);
    },
    (err) => {
      console.error('Error fetching tickets:', err);
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Mark a ticket as viewed by admin
 */
export async function markTicketAsViewed(ticketId: string): Promise<void> {
  await updateDoc(doc(firebaseDb, 'tickets', ticketId), {
    viewedByAdmin: true,
    viewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update ticket status and add to timeline
 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  // Get current ticket to preserve existing timeline
  const ticketDoc = await getDoc(doc(firebaseDb, 'tickets', ticketId));
  const currentData = ticketDoc.data() as any;
  const existingTimeline = currentData?.timeline || [];

  // Add new status to timeline
  // Use regular Date for timeline since serverTimestamp() is not supported in arrays
  const newTimeline = [
    ...existingTimeline,
    {
      status,
      timestamp: new Date(),
    },
  ];

  await updateDoc(doc(firebaseDb, 'tickets', ticketId), {
    status,
    updatedAt: serverTimestamp(),
    timeline: newTimeline,
  });
}

/**
 * Subscribe to user's own tickets
 */
export function subscribeMyTickets(
  onTickets: (tickets: Ticket[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const user = firebaseAuth.currentUser;
  if (!user) {
    if (onError) {
      onError(new Error('User must be authenticated'));
    }
    return () => {};
  }

  // Query without orderBy to avoid index requirement, sort in memory instead
  const q = query(collection(firebaseDb, 'tickets'), where('userId', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: Ticket[] = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as Omit<Ticket, 'id'>),
      }));
      // Sort by createdAt in memory to handle missing timeline
      tickets.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      onTickets(tickets);
    },
    (err) => {
      console.error('Error fetching user tickets:', err);
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Get count of unread tickets
 */
export function subscribeUnreadTicketCount(
  onCount: (count: number) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'tickets'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const unreadCount = snapshot.docs.filter(
        (d: any) => !(d.data() as any).viewedByAdmin || (d.data() as any).status === 'open',
      ).length;
      onCount(unreadCount);
    },
    (err) => {
      console.error('Error fetching unread ticket count:', err);
      if (onError) {
        onError(err);
      }
    },
  );
}
