const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceImage = path.join(__dirname, '../src/assets/images/Shop360Black.png');
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const basePath = path.join(__dirname, '../android/app/src/main/res');

async function resizeIcons() {
  console.log('Resizing app icons with Sharp...\n');

  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`Error: Source image not found at ${sourceImage}`);
    process.exit(1);
  }

  try {
    for (const [folder, size] of Object.entries(sizes)) {
      const folderPath = path.join(basePath, folder);
      const launcherPath = path.join(folderPath, 'ic_launcher.png');
      const roundPath = path.join(folderPath, 'ic_launcher_round.png');

      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Resize for regular icon
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(launcherPath);
      console.log(`✓ Created ${launcherPath} (${size}x${size})`);

      // Resize for round icon (same image, Android will handle rounding)
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(roundPath);
      console.log(`✓ Created ${roundPath} (${size}x${size})`);
    }

    console.log('\n✓ All app icons have been created successfully!');
    console.log('Now rebuild the app: npx react-native run-android');
  } catch (error) {
    console.error('Error creating icons:', error.message);
    process.exit(1);
  }
}

resizeIcons();

