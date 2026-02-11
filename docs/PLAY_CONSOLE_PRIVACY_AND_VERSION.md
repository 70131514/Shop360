# Play Console: Privacy Policy & Version Code

## 1. Version code already used

**Error:** *Version code 1 has already been used. Try another version code.*

**Fix (done in the app):**  
- `versionCode` is incremented in `android/app/build.gradle` for every new upload (e.g. 1 → 2 → 3 …).  
- `versionName` is set to a user-visible version (e.g. `"1.0.1"`).  

**Rule:** Each new AAB/APK you upload to the same Play listing **must** have a **higher** `versionCode` than the previous one. From now on, bump `versionCode` (and optionally `versionName`) before each release.

---

## 2. Privacy policy required (CAMERA and other permissions)

**Error:** *Your APK or Android App Bundle is using permissions that require a privacy policy: (android.permission.CAMERA).*

Google Play **requires a privacy policy URL** in the store listing when your app uses certain permissions. This is **not** fixed in the AAB; you add the URL in **Play Console**.

### Permissions in this app that require a privacy policy

| Permission | Why used |
|------------|----------|
| `android.permission.CAMERA` | Viro AR (try-on / AR scene) |
| `android.permission.ACCESS_FINE_LOCATION` | Delivery address: "Get Current Location" when adding a shipping address |
| `android.permission.ACCESS_COARSE_LOCATION` | Same as above (used with FINE for address detection) |

*Background location is not used; only when-in-use for the address form.*

Until a valid **privacy policy URL** is set in Play Console, uploads can be rejected for these permissions.

### What you need to do in Play Console

1. Open [Google Play Console](https://play.google.com/console/) → your app (**com.fyp.shop360**).
2. Go to **Policy** → **App content** (or **App content** in the left menu).
3. Find **Privacy policy**.
4. Click **Start** or **Manage** / **Edit**.
5. Enter the **URL** of your hosted privacy policy (must be publicly accessible, e.g. `https://...`).
6. Save.

After the URL is set and the form is completed, the “permissions require a privacy policy” error for your AAB upload should be resolved (for that policy requirement).

### Hosting your privacy policy

You already have `privacy-policy.html` (and `privacy-policy.css`) in the project root. You need to put it on a **public URL**, for example:

- **GitHub Pages:** Create a repo (e.g. `shop360-privacy`), enable Pages, add `privacy-policy.html` and `privacy-policy.css`, then use:  
  `https://<username>.github.io/shop360-privacy/privacy-policy.html`
- **University / personal website:** Upload the HTML (and CSS) and use that page URL.
- **Firebase Hosting / Netlify / similar:** Deploy the file and use the generated URL.

Use that **exact** URL in Play Console → App content → Privacy policy. No code change in the app is required for this step.

---

## 3. Declaring location permissions (undeclared permissions error)

**Error:** *Your app uses the following undeclared Location permissions: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION.*

Google Play requires you to **declare** why the app uses these permissions (in App content or the permissions declaration step during release).

**What we use location for:** Only when the user adds a delivery address and taps **"Get Current Location"** — to auto-fill city/region. We do **not** use background location.

**What to do in Play Console:**

1. Go to **Policy** → **App content** (or the step where it asks about sensitive permissions).
2. Find the section for **Location** / **Sensitive permissions**.
3. Declare that the app uses **Approximate location** and/or **Precise location**.
4. When asked "Why does your app need this?", use wording like:  
   **"To help users add delivery addresses quickly by detecting their current location when they tap 'Get Current Location' on the address form. Location is only used when the user is actively adding an address (when-in-use); not in background."**

The app no longer requests `ACCESS_BACKGROUND_LOCATION`; only FINE and COARSE are in the manifest.

---

## 3b. Play Console location form – copy-paste answers

**Important:** Upload an AAB built **after** removing `ACCESS_BACKGROUND_LOCATION` (run `./gradlew clean && ./gradlew bundleRelease` and upload that AAB). Then the “background location” part of the form may no longer be required. If you already uploaded an older AAB, upload a new version (higher versionCode) with the updated manifest.

### App purpose (main purpose of your app) — up to 500 characters

```
Shop360 is a shopping app that lets users browse products and view them in Augmented Reality (AR) in their own space. Users can add items to a wishlist, leave reviews, and manage delivery addresses. Location is used only when adding a delivery address: the user can tap "Get Current Location" to auto-fill their city/region. The app is a university Final Year Project (Bachelors CS & IT).
```

### Location access (foreground / when-in-use)

If the form asks why the app uses location (and not specifically “in the background”):

```
Location is used only when the user is adding a delivery address. They can tap "Get Current Location" on the address form to auto-fill city and region. Access is when-in-use only; the app does not use background location.
```

### Background location (if the form still asks)

The app **does not** use background location. We removed `ACCESS_BACKGROUND_LOCATION` from the manifest.

- **Describe one location-based feature that needs access to location in the background:**  
  **"This app does not use location in the background. Location is only used when the user is actively on the address form and taps Get Current Location (when-in-use). We do not request or use ACCESS_BACKGROUND_LOCATION."**

- **Video instructions:**  
  If the field is optional, leave blank or enter **N/A**. If it is required, upload a new AAB (built after removing background location) and resubmit; the background section may then disappear. If you must provide a link, you can upload a short video (e.g. to YouTube) showing: user opening Profile → Shipping Addresses → Add address → tapping “Get Current Location” and the permission prompt, with an on-screen or spoken line: “We only use location when you add an address; we do not use it in the background.” Then paste that video URL.

---

## 4. Checklist before each new AAB upload

- [ ] **Version code:** In `android/app/build.gradle`, `versionCode` is **greater** than the last uploaded version (e.g. 2, 3, 4 …).
- [ ] **Version name:** `versionName` updated if you want (e.g. `"1.0.1"`, `"1.0.2"`).
- [ ] **Privacy policy:** In Play Console → App content → Privacy policy, a valid public URL is set and the section is complete.
- [ ] **Location permissions:** Declared in Play Console with reason (delivery address / Get Current Location). See section 3 above.
- [ ] **Kotlin fix:** After `npm install`, the postinstall script applies the removeLast() → removeAt(lastIndex) fix in react-native-screens. Ensure you’ve run `npm install` before building the AAB so the fix is in place.
- [ ] Build release AAB:  
  `cd android && ./gradlew clean && ./gradlew bundleRelease`  
  Upload the new AAB from `android/app/build/outputs/bundle/release/app-release.aab`.

---

## 5. Other permissions from dependencies (Viro AR)

The merged manifest may include permissions added by **Viro/AR** libraries (e.g. `READ_EXTERNAL_STORAGE`, `RECORD_AUDIO`, `VIBRATE`, `NFC`). If Play Console asks you to declare or justify them:

- Declare them in **App content** / **Data safety** with the purpose (e.g. “AR/VR features from the Viro library; microphone/storage used only when the app’s AR feature is in use”).
- You cannot remove these from the app without removing or replacing the Viro dependency; declaring them is the correct approach.
