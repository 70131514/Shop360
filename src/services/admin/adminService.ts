import {
  collection,
  collectionGroup,
  limit,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseDb } from '../firebase';

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
        } as AdminOrderRow;
      });
      onOrders(rows);
    },
    onError,
  );
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


