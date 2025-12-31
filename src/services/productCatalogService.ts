import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseDb } from './firebase';

export type StoreProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
  rating: number;
  discountPercentage: number;
  stock: number;
  brand: string;
  modelUrl?: string;
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

function normalizeProduct(id: string, data: any): StoreProduct {
  const thumbnail = String(data?.thumbnail ?? '');
  const rawImages = data?.images;
  const images = Array.isArray(rawImages) ? rawImages.map((u: any) => String(u)).filter(Boolean) : [];
  const normalizedImages = images.length > 0 ? images : thumbnail ? [thumbnail] : [];

  return {
    id,
    title: String(data?.title ?? ''),
    price: Number(data?.price ?? 0),
    category: String(data?.category ?? ''),
    description: String(data?.description ?? ''),
    thumbnail,
    images: normalizedImages,
    rating: Number(data?.rating ?? 0),
    discountPercentage: Number(data?.discountPercentage ?? 0),
    stock: Number(data?.stock ?? 0),
    brand: String(data?.brand ?? ''),
    modelUrl: data?.modelUrl ? String(data.modelUrl) : undefined,
    isFeatured: Boolean(data?.isFeatured ?? false),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

export function subscribeProducts(
  onProducts: (products: StoreProduct[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(collection(firebaseDb, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const products = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
      onProducts(products);
    },
    onError,
  );
}

export async function getProductById(id: string): Promise<StoreProduct | null> {
  const snap = await getDoc(doc(firebaseDb, 'products', id));
  if (!snap.exists()) {
    return null;
  }
  return normalizeProduct(snap.id, snap.data());
}

export async function getProductsByCategory(params: {
  category: string;
  excludeId?: string;
  max?: number;
}): Promise<StoreProduct[]> {
  const max = Math.max(1, Math.min(50, Number(params.max ?? 12)));
  const q = query(collection(firebaseDb, 'products'), where('category', '==', params.category), limit(max));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
  return params.excludeId ? all.filter((p) => p.id !== params.excludeId) : all;
}

export function subscribeFeaturedProducts(
  onProducts: (products: StoreProduct[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(
    collection(firebaseDb, 'products'),
    where('isFeatured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  return onSnapshot(
    q,
    (snap) => {
      const products = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
      onProducts(products);
    },
    onError,
  );
}


