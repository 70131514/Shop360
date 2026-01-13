import storage, { deleteObject, getDownloadURL, putFile, ref } from '@react-native-firebase/storage';
import { getApp } from '@react-native-firebase/app';

// Get the storage instance using the app instance to avoid deprecation warning
const getStorageInstance = () => {
  const app = getApp();
  return storage(app);
};

function safeSegment(input: string): string {
  return String(input || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

function inferExt(fileName?: string, uri?: string): string {
  const fromName = String(fileName || '')
    .trim()
    .split('.')
    .pop();
  if (fromName && fromName.length <= 8 && fromName !== fileName) {
    return fromName.toLowerCase();
  }
  const fromUri = String(uri || '')
    .split('?')[0]
    .split('#')[0]
    .split('.')
    .pop();
  if (fromUri && fromUri.length <= 8 && fromUri !== uri) {
    return fromUri.toLowerCase();
  }
  return '';
}

function normalizeLocalPath(uri: string): string {
  const u = String(uri || '').trim();
  if (u.startsWith('file://')) {
    return u.replace('file://', '');
  }
  return u;
}

export type PickedLocalFile = {
  uri: string; // can be file://... (preferred) or content://...
  name?: string;
};

export async function uploadProductImage(params: {
  productId: string;
  file: PickedLocalFile;
}): Promise<{ downloadUrl: string; storagePath: string }> {
  const { productId, file } = params;
  const ext = inferExt(file.name, file.uri) || 'jpg';
  const baseName = safeSegment(file.name || `image.${ext}`) || `image.${ext}`;
  const objectName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}`;
  const storagePath = `images/${safeSegment(productId)}/${objectName}`;

  const storageInstance = getStorageInstance();
  const storageRef = ref(storageInstance, storagePath);
  await putFile(storageRef, normalizeLocalPath(file.uri));
  const downloadUrl = await getDownloadURL(storageRef);
  return { downloadUrl, storagePath };
}

export async function uploadProductModel(params: {
  productId: string;
  file: PickedLocalFile;
}): Promise<{ downloadUrl: string; storagePath: string }> {
  const { productId, file } = params;
  const ext = inferExt(file.name, file.uri) || 'glb';
  const baseName = safeSegment(file.name || `model.${ext}`) || `model.${ext}`;
  const objectName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}`;
  const storagePath = `models/${safeSegment(productId)}/${objectName}`;

  const storageInstance = getStorageInstance();
  const storageRef = ref(storageInstance, storagePath);
  await putFile(storageRef, normalizeLocalPath(file.uri));
  const downloadUrl = await getDownloadURL(storageRef);
  return { downloadUrl, storagePath };
}

/**
 * Delete a file from Firebase Storage by its storage path
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (!storagePath || !storagePath.trim()) {
    return; // Skip empty paths
  }

  try {
    const storageInstance = getStorageInstance();
    const storageRef = ref(storageInstance, storagePath);
    await deleteObject(storageRef);
  } catch (error: any) {
    // If file doesn't exist (404), that's okay - it's already deleted
    // Log other errors but don't throw to allow deletion to continue
    if (error?.code !== 'storage/object-not-found') {
      console.warn(`Failed to delete storage file ${storagePath}:`, error);
    }
  }
}

/**
 * Delete a file from Firebase Storage by its download URL
 * Extracts the storage path from the URL
 */
export async function deleteStorageFileByUrl(downloadUrl: string): Promise<void> {
  if (!downloadUrl || !downloadUrl.trim()) {
    return;
  }

  try {
    // Extract storage path from Firebase Storage download URL
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
    const url = new URL(downloadUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      // Decode the path (Firebase Storage URLs are URL-encoded)
      const storagePath = decodeURIComponent(pathMatch[1]);
      await deleteStorageFile(storagePath);
    } else {
      console.warn(`Could not extract storage path from URL: ${downloadUrl}`);
    }
  } catch (error) {
    // If URL parsing fails, try to extract path manually
    try {
      // Fallback: try to extract path from URL string directly
      const match = downloadUrl.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        const storagePath = decodeURIComponent(match[1]);
        await deleteStorageFile(storagePath);
      }
    } catch (fallbackError) {
      console.warn(`Failed to delete storage file from URL ${downloadUrl}:`, fallbackError);
    }
  }
}

/**
 * Delete multiple storage files by their URLs
 */
export async function deleteStorageFilesByUrls(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) {
    return;
  }

  // Delete all files in parallel (best effort - don't fail if some fail)
  const promises = urls.map((url) => deleteStorageFileByUrl(url).catch((error) => {
    console.warn(`Failed to delete storage file from URL ${url}:`, error);
    return null;
  }));

  await Promise.all(promises);
}
