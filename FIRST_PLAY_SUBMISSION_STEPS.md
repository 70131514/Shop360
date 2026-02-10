# Steps Before First Play Store Submission

Follow these in order. **Step 1 (Release Keystore)** is required for every release build you upload to Play.

---

## Step 1: Create and Configure the Release Keystore

The release keystore is used to sign your app. Google Play needs this **same keystore** for all future updates. **If you lose it, you cannot update your app on Play.**

### 1.1 Create the keystore (one-time)

1. Open a terminal (PowerShell or Command Prompt on Windows; Terminal on Mac/Linux).

2. Go to a folder where you want to keep the keystore. For example, inside your project:
   - **Windows:**  
     `cd "D:\University\FYP\Mobile App\Shop360\android\app"`
   - **Mac/Linux:**  
     `cd "/path/to/Shop360/android/app"`

3. Run this command (one line):

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore shop360-release.keystore -alias shop360 -keyalg RSA -keysize 2048 -validity 10000
   ```

4. When prompted, enter:
   - **Keystore password:** Choose a strong password and **write it down somewhere safe**.
   - **Re-enter password:** Same password.
   - **Key password:** Press **Enter** to use the same password as the keystore (recommended).
   - **First and last name:** Your name or app name (e.g. `Shop360`).
   - **Organizational unit / Organization / City / State / Country:** Fill as needed (e.g. your university or “FYP”).

5. The file `shop360-release.keystore` is created in the current folder. **Back it up** to a safe place (USB drive, cloud backup). **Do not commit it to Git** (add it to `.gitignore` if it’s inside the repo).

### 1.2 Configure Gradle to use the keystore

You must set four properties so the release build can sign the app. Use **one** of the options below.

**Option A – Keystore inside the project (e.g. `android/app/`)**

If you created the keystore in `android/app/` and it’s named `shop360-release.keystore`:

1. Open **`android/gradle.properties`** in your project.

2. Add these lines at the bottom (use your real passwords):

   ```properties
   MYAPP_RELEASE_STORE_FILE=app/shop360-release.keystore
   MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password_here
   MYAPP_RELEASE_KEY_ALIAS=shop360
   MYAPP_RELEASE_KEY_PASSWORD=your_key_password_here
   ```

   If you use the same password for keystore and key, set both `MYAPP_RELEASE_STORE_PASSWORD` and `MYAPP_RELEASE_KEY_PASSWORD` to that password.

3. **Important:** Do not commit real passwords to a public repo. Either:
   - Keep `android/gradle.properties` private (e.g. don’t push it), or  
   - Use **Option B** and put the four properties in **`~/.gradle/gradle.properties`** (in your user folder) so they never go into the repo.

**Option B – Keystore in a safe place (recommended for teams)**

1. Copy `shop360-release.keystore` to a safe folder **outside** the project (e.g. `D:\Keystores\` or `~/keystores/`).

2. Create or open the file **`~/.gradle/gradle.properties`**:
   - **Windows:** `C:\Users\YourUsername\.gradle\gradle.properties`
   - **Mac/Linux:** `~/.gradle/gradle.properties`

3. Add (replace the path and passwords with your real values):

   **Windows:**
   ```properties
   MYAPP_RELEASE_STORE_FILE=D:/Keystores/shop360-release.keystore
   MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
   MYAPP_RELEASE_KEY_ALIAS=shop360
   MYAPP_RELEASE_KEY_PASSWORD=your_key_password
   ```

   **Mac/Linux:**
   ```properties
   MYAPP_RELEASE_STORE_FILE=/Users/yourname/keystores/shop360-release.keystore
   MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
   MYAPP_RELEASE_KEY_ALIAS=shop360
   MYAPP_RELEASE_KEY_PASSWORD=your_key_password
   ```

   Use forward slashes in the path. On Windows you can use `C:/Keystores/shop360-release.keystore`.

### 1.3 Verify release signing

From the project root:

```bash
cd android
./gradlew bundleRelease
```

On Windows:

```bash
cd android
gradlew.bat bundleRelease
```

If the four properties are set correctly, the build finishes and the signed App Bundle is at:

**`android/app/build/outputs/bundle/release/app-release.aab`**

If you see signing errors, double-check the path, alias, and both passwords.

---

## Step 2: Set the Google Maps API key

1. Open **`android/app/src/main/AndroidManifest.xml`**.
2. Find the line with `YOUR_GOOGLE_MAPS_API_KEY`.
3. Replace it with your real API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) (create/use an Android key restricted to package `com.shop360`).
4. Save the file.

---

## Step 3: Deploy Firebase rules

From the project root:

```bash
npx firebase deploy --only firestore,storage
```

This deploys Firestore rules + indexes and Storage rules. If you get “project is being set up,” wait a few minutes and try again.

---

## Step 4: Fill in Play Console Data safety

1. Go to [Google Play Console](https://play.google.com/console) → your app.
2. Open **App content** → **Data safety**.
3. Declare what data you collect (e.g. email, name, address, payment info) and how it’s used (account, orders, shipping). Say you don’t sell data.
4. Save and submit the form.

---

## Step 5: Build the AAB and upload to Play

1. Build the release bundle (from project root):

   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   (Windows: `gradlew.bat bundleRelease`)

2. Locate the file: **`android/app/build/outputs/bundle/release/app-release.aab`**.

3. In Play Console go to **Release** → **Production** (or a testing track) → **Create new release**.
4. Upload **`app-release.aab`**.
5. Complete the release (version name, release notes, etc.) and submit for review.

---

## Quick checklist

- [ ] **Step 1:** Create `shop360-release.keystore`, back it up, set `MYAPP_RELEASE_*` in `android/gradle.properties` or `~/.gradle/gradle.properties`, and run `./gradlew bundleRelease` successfully.
- [ ] **Step 2:** Replace `YOUR_GOOGLE_MAPS_API_KEY` in `AndroidManifest.xml`.
- [ ] **Step 3:** Run `npx firebase deploy --only firestore,storage`.
- [ ] **Step 4:** Complete Data safety in Play Console.
- [ ] **Step 5:** Upload `app-release.aab` and submit for review.

After this, your first Play submission is ready.
