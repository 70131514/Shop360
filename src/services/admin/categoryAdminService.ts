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

export function slugifyCategoryName(name: string): string {
  const s = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s;
}

export async function createCategory(input: { name: string }): Promise<string> {
  const name = String(input.name || '').trim();
  if (!name) {
    throw new Error('Category name is required');
  }
  const id = slugifyCategoryName(name);
  if (!id) {
    throw new Error('Category name is invalid');
  }

  const ref = doc(firebaseDb, 'categories', id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error('Category already exists');
  }

  await setDoc(ref, {
    id,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any);
  return id;
}

export async function renameCategory(input: { id: string; name: string }): Promise<void> {
  const id = String(input.id || '').trim();
  const name = String(input.name || '').trim();

  if (!id) {
    throw new Error('Category id is required');
  }
  if (!name) {
    throw new Error('Category name is required');
  }

  if (name.length > 50) {
    throw new Error('Category name must be 50 characters or less');
  }

  // Check if category exists
  const categoryRef = doc(firebaseDb, 'categories', id);
  const categorySnap = await getDoc(categoryRef);
  if (!categorySnap.exists()) {
    throw new Error('Category not found');
  }

  // Check if new name would create a duplicate (different slug)
  const newSlug = slugifyCategoryName(name);
  if (newSlug !== id) {
    // Name would result in different slug, check if that slug already exists
    const existingRef = doc(firebaseDb, 'categories', newSlug);
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists()) {
      throw new Error(`A category with the name "${name}" already exists`);
    }
  }

  await updateDoc(categoryRef, {
    name,
    updatedAt: serverTimestamp(),
  } as any);
}

export async function deleteCategory(input: { id: string }): Promise<void> {
  const id = String(input.id || '').trim();
  if (!id) {
    throw new Error('Category id is required');
  }

  // Safety: don't delete categories that still have products.
  const q = query(collection(firebaseDb, 'products'), where('category', '==', id), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    throw new Error('Category has products. Move/delete products first.');
  }

  await deleteDoc(doc(firebaseDb, 'categories', id));
}
