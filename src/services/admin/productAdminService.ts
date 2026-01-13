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
  writeBatch,
} from '@react-native-firebase/firestore';
import { firebaseDb } from '../firebase';
import { deleteStorageFilesByUrls } from '../storageService';
import { createNotificationsForUsers } from '../notificationService';
import { getCart, storeCart, getWishlist, storeWishlist } from '../../utils/storage';

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

  const productData = existing.data() as AdminProduct;
  const productTitle = productData.title || 'this product';

  // Step 1: Check if product is in any active orders (processing or shipped)
  // We cannot delete products that are in active orders
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

  // Step 2: Find all users who have this product in their cart (Firestore)
  const cartsQuery = query(
    collectionGroup(firebaseDb, 'cart'),
    where('id', '==', idTrimmed),
  );
  const cartsSnap = await getDocs(cartsQuery);

  // Collect user IDs who have this product in their cart
  const affectedUserIds = new Set<string>();
  const cartDocsToDelete: Array<{ userId: string; productId: string }> = [];

  cartsSnap.docs.forEach((cartDoc) => {
    // Extract userId from the document path: users/{userId}/cart/{productId}
    const pathParts = cartDoc.ref.path.split('/');
    if (pathParts.length >= 2 && pathParts[0] === 'users') {
      const userId = pathParts[1];
      affectedUserIds.add(userId);
      cartDocsToDelete.push({ userId, productId: idTrimmed });
    }
  });

  // Step 3: Find all users who have this product in their wishlist (Firestore)
  const wishlistsQuery = query(
    collectionGroup(firebaseDb, 'wishlist'),
    where('id', '==', idTrimmed),
  );
  const wishlistsSnap = await getDocs(wishlistsQuery);

  const wishlistDocsToDelete: Array<{ userId: string; productId: string }> = [];

  wishlistsSnap.docs.forEach((wishlistDoc) => {
    // Extract userId from the document path: users/{userId}/wishlist/{productId}
    const pathParts = wishlistDoc.ref.path.split('/');
    if (pathParts.length >= 2 && pathParts[0] === 'users') {
      const userId = pathParts[1];
      affectedUserIds.add(userId);
      wishlistDocsToDelete.push({ userId, productId: idTrimmed });
    }
  });

  // Step 4: Remove product from guest carts and wishlists (AsyncStorage)
  // Note: We can't know which guests have the product, so we'll clean it from all guest carts/wishlists
  // This is safe because guest data is local-only
  try {
    const guestCart = (await getCart()) || [];
    const updatedGuestCart = guestCart.filter((item: any) => item?.id !== idTrimmed);
    if (updatedGuestCart.length !== guestCart.length) {
      await storeCart(updatedGuestCart);
    }
  } catch (error) {
    console.warn('Failed to remove product from guest carts:', error);
  }

  try {
    const guestWishlist = (await getWishlist()) || [];
    const updatedGuestWishlist = guestWishlist.filter((item: any) => item?.id !== idTrimmed);
    if (updatedGuestWishlist.length !== guestWishlist.length) {
      await storeWishlist(updatedGuestWishlist);
    }
  } catch (error) {
    console.warn('Failed to remove product from guest wishlists:', error);
  }

  // Step 5: Delete product from Firestore carts and wishlists using batch
  const batch = writeBatch(firebaseDb);
  cartDocsToDelete.forEach(({ userId, productId }) => {
    const cartRef = doc(firebaseDb, 'users', userId, 'cart', productId);
    batch.delete(cartRef);
  });
  wishlistDocsToDelete.forEach(({ userId, productId }) => {
    const wishlistRef = doc(firebaseDb, 'users', userId, 'wishlist', productId);
    batch.delete(wishlistRef);
  });

  // Commit batch deletion of carts and wishlists
  if (cartDocsToDelete.length > 0 || wishlistDocsToDelete.length > 0) {
    await batch.commit();
  }

  // Step 6: Delete storage files (thumbnail, images, modelUrl)
  const storageUrlsToDelete: string[] = [];
  if (productData.thumbnail) {
    storageUrlsToDelete.push(productData.thumbnail);
  }
  if (Array.isArray(productData.images)) {
    storageUrlsToDelete.push(...productData.images.filter(Boolean));
  }
  if (productData.modelUrl) {
    storageUrlsToDelete.push(productData.modelUrl);
  }

  // Delete storage files (best effort - don't fail if some fail)
  if (storageUrlsToDelete.length > 0) {
    await deleteStorageFilesByUrls(storageUrlsToDelete).catch((error) => {
      console.warn('Failed to delete some storage files:', error);
      // Continue with deletion even if storage cleanup fails
    });
  }

  // Step 7: Send notifications to affected users
  if (affectedUserIds.size > 0) {
    const userIdsArray = Array.from(affectedUserIds);
    const hasCart = cartDocsToDelete.length > 0;
    const hasWishlist = wishlistDocsToDelete.length > 0;

    let message = '';
    if (hasCart && hasWishlist) {
      message = `"${productTitle}" has been removed from your cart and wishlist as it is no longer available.`;
    } else if (hasCart) {
      message = `"${productTitle}" has been removed from your cart as it is no longer available.`;
    } else if (hasWishlist) {
      message = `"${productTitle}" has been removed from your wishlist as it is no longer available.`;
    }

    if (message) {
      await createNotificationsForUsers({
        userIds: userIdsArray,
        title: 'Product Unavailable',
        message,
        type: 'product_removed',
        data: { productId: idTrimmed },
      }).catch((error) => {
        console.warn('Failed to create notifications for affected users:', error);
        // Continue with deletion even if notifications fail
      });
    }
  }

  // Step 8: Delete the product document from Firestore
  await deleteDoc(ref);
}
