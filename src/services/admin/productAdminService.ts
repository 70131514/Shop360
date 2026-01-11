import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { firebaseDb } from '../firebase';

export type AdminProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
  images: string[];
  rating: number;
  discountPercentage: number;
  brand?: string;
  description?: string;
  modelUrl?: string;
  isFeatured?: boolean;
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

export function generateNewProductId(): string {
  // Create a doc ref locally to get an id without writing yet.
  const ref = doc(collection(firebaseDb, 'products'));
  return ref.id;
}

export async function upsertProduct(input: {
  id?: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  thumbnail: string;
  images: string[];
  rating: number;
  discountPercentage: number;
  brand?: string;
  description?: string;
  modelUrl?: string;
  isFeatured?: boolean;
}): Promise<string> {
  // Validate that the category exists
  const categoryId = String(input.category || '').trim();
  if (!categoryId) {
    throw new Error('Category is required');
  }
  const categoryRef = doc(firebaseDb, 'categories', categoryId);
  const categorySnap = await getDoc(categoryRef);
  if (!categorySnap.exists()) {
    throw new Error(`Category "${categoryId}" does not exist. Please select a valid category.`);
  }

  const payload = {
    title: input.title,
    category: input.category,
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    thumbnail: input.thumbnail ?? '',
    images: Array.isArray(input.images) ? input.images : [],
    rating: Number(input.rating ?? 0),
    discountPercentage: Number(input.discountPercentage ?? 0),
    brand: input.brand ?? '',
    description: input.description ?? '',
    modelUrl: input.modelUrl ?? '',
    isFeatured: Boolean(input.isFeatured ?? false),
    updatedAt: serverTimestamp(),
  };

  if (input.id) {
    const ref = doc(firebaseDb, 'products', input.id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload as any);
      return input.id;
    }

    await setDoc(
      ref,
      {
        ...payload,
        id: input.id,
        createdAt: serverTimestamp(),
      } as any,
      { merge: true },
    );
    return input.id;
  }

  // Prefer setting a doc with a known id (lets us upload assets to a stable path if needed).
  const ref = doc(collection(firebaseDb, 'products'));
  await setDoc(
    ref,
    {
      ...payload,
      id: ref.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as any,
    { merge: true },
  );
  return ref.id;
}

export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(firebaseDb, 'products', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error('Product not found');
  }

  // Check if product is in any active orders (not cancelled or delivered)
  // We need to check all users' orders collections
  const usersRef = collection(firebaseDb, 'users');
  const usersSnap = await getDocs(usersRef);
  
  // Check active orders first
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const ordersRef = collection(firebaseDb, 'users', userId, 'orders');
    const ordersSnap = await getDocs(ordersRef);
    
    for (const orderDoc of ordersSnap.docs) {
      const orderData = orderDoc.data();
      const status = orderData?.status;
      
      // Only check active orders (processing or shipped)
      if (status === 'processing' || status === 'shipped') {
        const items = orderData?.items || [];
        const hasProduct = items.some((item: any) => item.productId === id);
        if (hasProduct) {
          throw new Error(
            `Cannot delete product. It is in an active order (${status}). Please wait for the order to be completed or cancelled.`
          );
        }
      }
    }
  }

  // Check if product is in any user carts
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const cartRef = doc(firebaseDb, 'users', userId, 'cart', id);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      throw new Error(
        'Cannot delete product. It is currently in one or more user carts. Please wait for users to remove it from their carts.'
      );
    }
  }

  await deleteDoc(ref);
}
