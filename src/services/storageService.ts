import storage from '@react-native-firebase/storage';

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

  const ref = storage().ref(storagePath);
  await ref.putFile(normalizeLocalPath(file.uri));
  const downloadUrl = await ref.getDownloadURL();
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

  const ref = storage().ref(storagePath);
  await ref.putFile(normalizeLocalPath(file.uri));
  const downloadUrl = await ref.getDownloadURL();
  return { downloadUrl, storagePath };
}
