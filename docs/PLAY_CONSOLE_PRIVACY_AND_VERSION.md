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
| `android.permission.ACCESS_FINE_LOCATION` | Location / recommendations |
| `android.permission.ACCESS_COARSE_LOCATION` | Location |
| `android.permission.ACCESS_BACKGROUND_LOCATION` | Background location (if used) |

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

## 3. Checklist before each new AAB upload

- [ ] **Version code:** In `android/app/build.gradle`, `versionCode` is **greater** than the last uploaded version (e.g. 2, 3, 4 …).
- [ ] **Version name:** `versionName` updated if you want (e.g. `"1.0.1"`, `"1.0.2"`).
- [ ] **Privacy policy:** In Play Console → App content → Privacy policy, a valid public URL is set and the section is complete.
- [ ] Build release AAB:  
  `cd android && ./gradlew clean && ./gradlew bundleRelease`  
  Upload the new AAB from `android/app/build/outputs/bundle/release/app-release.aab`.
