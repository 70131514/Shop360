import {
  collection,
  collectionGroup,
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
  isNewArrival?: boolean;
  isBestSeller?: boolean;
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
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}): Promise<string> {
  // Validate title
  const title = String(input.title || '').trim();
  if (!title) {
    throw new Error('Product title is required');
  }
  if (title.length > 200) {
    throw new Error('Product title must be 200 characters or less');
  }

  // Validate category
  const categoryId = String(input.category || '').trim();
  if (!categoryId) {
    throw new Error('Category is required');
  }
  const categoryRef = doc(firebaseDb, 'categories', categoryId);
  const categorySnap = await getDoc(categoryRef);
  if (!categorySnap.exists()) {
    throw new Error(`Category "${categoryId}" does not exist. Please select a valid category.`);
  }

  // Validate price
  const price = Number(input.price ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Price must be a valid number greater than or equal to 0');
  }
  if (price > 1000000) {
    throw new Error('Price cannot exceed $1,000,000');
  }

  // Validate stock
  const stock = Number(input.stock ?? 0);
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('Stock must be a valid number greater than or equal to 0');
  }
  if (stock > 1000000) {
    throw new Error('Stock cannot exceed 1,000,000');
  }

  // Validate discount percentage
  const discountPercentage = Number(input.discountPercentage ?? 0);
  if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }

  // Validate rating
  const rating = Number(input.rating ?? 0);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }

  // Validate thumbnail
  const thumbnail = String(input.thumbnail ?? '').trim();
  if (!thumbnail) {
    throw new Error('Product thumbnail image is required');
  }

  // Validate images array
  const images = Array.isArray(input.images)
    ? input.images.map((img) => String(img).trim()).filter(Boolean)
    : [];
  if (images.length === 0) {
    throw new Error('At least one product image is required');
  }
  if (images.length > 10) {
    throw new Error('Maximum 10 images allowed per product');
  }

  const payload = {
    title,
    category: categoryId,
    price,
    stock: Math.floor(stock),
    thumbnail,
    images,
    rating: Math.max(0, Math.min(5, Math.round(rating * 10) / 10)), // Round to 1 decimal, clamp 0-5
    discountPercentage: Math.max(0, Math.min(100, Math.round(discountPercentage * 10) / 10)), // Round to 1 decimal, clamp 0-100
    brand: String(input.brand ?? '').trim(),
    description: String(input.description ?? '').trim(),
    modelUrl: input.modelUrl ? String(input.modelUrl).trim() : '',
    isFeatured: Boolean(input.isFeatured ?? false),
    isNewArrival: Boolean(input.isNewArrival ?? false),
    isBestSeller: Boolean(input.isBestSeller ?? false),
    updatedAt: serverTimestamp(),
  };

  if (input.id) {
    const ref = doc(firebaseDb, 'products', input.id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      // Use updateDoc for existing products - this is safe as Firestore updates are atomic
      // Stock updates by admin will be reflected immediately, and any concurrent orders
      // will use transactions that read the latest stock value
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
  const idTrimmed = String(id || '').trim();
  if (!idTrimmed) {
    throw new Error('Product ID is required');
  }

  const ref = doc(firebaseDb, 'products', idTrimmed);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error('Product not found');
  }

  // Optimized: Use collectionGroup to check all orders at once
  // Check if product is in any active orders (processing or shipped)
  // Note: We check up to 1000 active orders. If there are more, we may miss some,
  // but this is a reasonable trade-off for performance vs. checking all users individually.
  const activeOrdersQuery = query(
    collectionGroup(firebaseDb, 'orders'),
    where('status', 'in', ['processing', 'shipped']),
    limit(1000),
  );
  const activeOrdersSnap = await getDocs(activeOrdersQuery);

  // Check if we hit the limit (potential edge case)
  if (activeOrdersSnap.docs.length === 1000) {
    console.warn(
      'deleteProduct: Checking 1000 active orders. If there are more, some may not be checked. Consider increasing limit if needed.',
    );
  }

  for (const orderDoc of activeOrdersSnap.docs) {
    const orderData = orderDoc.data();
    const items = orderData?.items || [];
    if (!Array.isArray(items)) {
      continue; // Skip invalid order data
    }
    const hasProduct = items.some((item: any) => item?.productId === idTrimmed);
    if (hasProduct) {
      const status = orderData?.status || 'unknown';
      throw new Error(
        `Cannot delete product. It is in an active order (${status}). Please wait for the order to be completed or cancelled.`,
      );
    }
  }

  // Optimized: Use collectionGroup to check all carts at once
  const cartsQuery = query(
    collectionGroup(firebaseDb, 'cart'),
    where('id', '==', idTrimmed),
    limit(1),
  );
  const cartsSnap = await getDocs(cartsQuery);
  if (!cartsSnap.empty) {
    throw new Error(
      'Cannot delete product. It is currently in one or more user carts. Please wait for users to remove it from their carts.',
    );
  }

  await deleteDoc(ref);
}
