# Storage audit — Shop360 (Play Store safety)

## Two different “storages” in the app

| Kind | What it is | What’s in it | Play / safety |
|------|------------|--------------|----------------|
| **Firebase Storage (cloud)** | `@react-native-firebase/storage` | Product images and 3D models only | See below. |
| **AsyncStorage (on device)** | `@react-native-async-storage/async-storage` | Theme, guest cart/wishlist, font size, cached user prefs, avatars | Local only; not “cloud storage” for Play. |

This doc focuses on **Firebase Storage** and what to do for the Play Store.

---

## What Firebase Storage is used for

- **Product images** – thumbnails and gallery images for products.  
  Paths: `images/{productId}/{filename}`
- **Product 3D models** – AR models (e.g. `.glb`).  
  Paths: `models/{productId}/{filename}`

**Who writes:**  
Only admins, from **Admin product edit** (create/edit product, upload images and model).  
**Who reads:**  
Anyone (app catalog, product detail, AR scene). Public read is intentional.

**Code:**  
- `src/services/storageService.ts` – upload (image/model), delete by path/URL.  
- `src/services/admin/productAdminService.ts` – deletes Storage files when a product is deleted.  
- `src/screens/admin/AdminProductEditScreen.tsx` – calls upload.  
- AR scene – loads model from product’s `modelUrl` (Firebase Storage URL).

---

## Current security (storage.rules)

- **Read**  
  - `images/{productId}/**` and `models/{productId}/**`: **allow** (public catalog/AR).  
  - Any other path: **deny** (catch-all).
- **Write**  
  - `images/` and `models/`: only if **authenticated + admin + email verified**.  
  - Any other path: **deny**.

So: no open write, no user PII in Storage, only product assets. Safe for production and Play.

---

## What to do for Play Store

1. **Use and deploy Storage rules**  
   You already have `storage.rules` in the repo and it’s referenced in `firebase.json`.  
   - In Firebase Console: enable **Storage** for the project if not already.  
   - Deploy rules:  
     ```bash
     firebase deploy --only storage
     ```  
   Without deployed rules, Firebase may use default (e.g. deny all), which can break image/model load or upload.

2. **Data Safety / policy**  
   - Firebase Storage here holds **only product images and 3D models** (admin-uploaded catalog content).  
   - No user-generated personal content, no PII in Storage.  
   - You don’t need to declare “user data stored in cloud” for this Storage usage.  
   - In Data Safety, focus on what you collect in the app (e.g. email, name, address, payment info) as in your main Play audit.

3. **Path safety**  
   - `storageService` uses `safeSegment()` so `productId` and file names are sanitized (no path traversal).  
   - No change needed for Play.

4. **Optional hardening (already true)**  
   - Only admin screens call upload; rules enforce admin + email verified on the server, so a modified client still cannot upload.  
   - Catch-all rule denies any path outside `images/` and `models/`.

---

## Summary

- **Firebase Storage** = product images + 3D models only; admin write, public read; rules are production-safe.  
- **AsyncStorage** = local device only; no extra Play “storage” obligations beyond your normal data practices.  
- **Action:** Enable Storage in Firebase (if needed), run `firebase deploy --only storage`, and keep using the existing `storage.rules` for a Play-safe setup.
