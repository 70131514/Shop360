import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseDb } from './firebase';

export type StoreCategory = {
  id: string; // slug
  name: string;
  createdAt?: any;
  updatedAt?: any;
};

function normalizeCategory(id: string, data: any): StoreCategory {
  return {
    id,
    name: String(data?.name ?? id),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

export function subscribeCategories(
  onCategories: (categories: StoreCategory[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'categories'), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => normalizeCategory(d.id, d.data()));
      onCategories(rows);
    },
    onError,
  );
}

export async function getCategoryById(id: string): Promise<StoreCategory | null> {
  const snap = await getDoc(doc(firebaseDb, 'categories', id));
  if (!snap.exists()) {
    return null;
  }
  return normalizeCategory(snap.id, snap.data());
}


