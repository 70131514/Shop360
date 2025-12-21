import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import type { Unsubscribe } from '@react-native-firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: any;
  updatedAt?: any;
};

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) {
    throw new Error('No authenticated user');
  }
  return uid;
}

function addressesCollectionRef(uid: string) {
  return collection(firebaseDb, 'users', uid, 'addresses');
}

/**
 * Get all addresses for the current user
 */
export async function getMyAddresses(): Promise<Address[]> {
  const uid = requireUid();
  const q = query(addressesCollectionRef(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Address[];
}

/**
 * Subscribe to addresses for the current user
 */
export function subscribeMyAddresses(
  onAddresses: (addresses: Address[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const uid = requireUid();
  const q = query(addressesCollectionRef(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const addresses = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Address[];
      onAddresses(addresses);
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
  );
}

/**
 * Add a new address for the current user
 */
export async function addAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const uid = requireUid();
  
  // If this is set as default, unset all other defaults
  if (address.isDefault) {
    const existingAddresses = await getMyAddresses();
    const batch = writeBatch(firebaseDb);
    
    existingAddresses.forEach((addr) => {
      if (addr.isDefault) {
        batch.update(doc(firebaseDb, 'users', uid, 'addresses', addr.id), { isDefault: false });
      }
    });
    
    await batch.commit();
  }
  
  const addressRef = await addDoc(addressesCollectionRef(uid), {
    ...address,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return addressRef.id;
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string,
  updates: Partial<Omit<Address, 'id' | 'createdAt'>>,
): Promise<void> {
  const uid = requireUid();
  
  // If setting as default, unset all other defaults
  if (updates.isDefault === true) {
    const existingAddresses = await getMyAddresses();
    const batch = writeBatch(firebaseDb);
    
    existingAddresses.forEach((addr) => {
      if (addr.id !== addressId && addr.isDefault) {
        batch.update(doc(firebaseDb, 'users', uid, 'addresses', addr.id), { isDefault: false });
      }
    });
    
    await batch.commit();
  }
  
  await updateDoc(doc(firebaseDb, 'users', uid, 'addresses', addressId), {
    ...updates,
    updatedAt: serverTimestamp(),
  } as any);
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(firebaseDb, 'users', uid, 'addresses', addressId));
}

/**
 * Set an address as default (unsetting others)
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const uid = requireUid();
  const existingAddresses = await getMyAddresses();
  const batch = writeBatch(firebaseDb);
  
  existingAddresses.forEach((addr) => {
    if (addr.id === addressId) {
      batch.update(doc(firebaseDb, 'users', uid, 'addresses', addr.id), { 
        isDefault: true,
        updatedAt: serverTimestamp(),
      });
    } else if (addr.isDefault) {
      batch.update(doc(firebaseDb, 'users', uid, 'addresses', addr.id), { 
        isDefault: false,
        updatedAt: serverTimestamp(),
      });
    }
  });
  
  await batch.commit();
}

