import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { firebaseDb } from '../firebase';

export type AdminProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
  brand?: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
};

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const snap = await getDoc(doc(firebaseDb, 'products', id));
  if (!snap.exists()) {
    return null;
  }
  return { id: snap.id, ...(snap.data() as any) } as AdminProduct;
}

export async function upsertProduct(input: {
  id?: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
  brand?: string;
  description?: string;
}): Promise<string> {
  const payload = {
    title: input.title,
    category: input.category,
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    thumbnail: input.thumbnail ?? '',
    brand: input.brand ?? '',
    description: input.description ?? '',
    updatedAt: serverTimestamp(),
  };

  if (input.id) {
    await updateDoc(doc(firebaseDb, 'products', input.id), payload as any);
    return input.id;
  }

  const ref = await addDoc(collection(firebaseDb, 'products'), {
    ...payload,
    createdAt: serverTimestamp(),
  } as any);

  // Ensure document has stable id field if you later want it
  try {
    await setDoc(doc(firebaseDb, 'products', ref.id), { id: ref.id } as any, { merge: true });
  } catch {
    // ignore
  }

  return ref.id;
}


