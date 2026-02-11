#!/usr/bin/env node
/**
 * Applies Kotlin removeLast() -> removeAt(lastIndex) fix for Android 14 compatibility.
 * See: https://developer.android.com/guide/practices/crashes#kotlin-removefirst-removelast
 * This script never fails the install (always exits 0).
 */
const fs = require('fs');
const path = require('path');

function main() {
  try {
    const filePath = path.join(
      __dirname,
      '..',
      'node_modules',
      'react-native-screens',
      'android',
      'src',
      'main',
      'java',
      'com',
      'swmansion',
      'rnscreens',
      'ScreenStack.kt'
    );

    if (!fs.existsSync(filePath)) {
      console.warn('patch-react-native-screens: ScreenStack.kt not found, skipping.');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const original = 'drawingOpPool.removeLast()';
    const replacement = 'drawingOpPool.removeAt(drawingOpPool.lastIndex)';

    if (content.includes(replacement)) {
      console.log('patch-react-native-screens: Fix already applied.');
      return;
    }

    if (!content.includes(original)) {
      console.warn('patch-react-native-screens: Expected line not found, skipping.');
      return;
    }

    content = content.replace(original, replacement);
    fs.writeFileSync(filePath, content);
    console.log('patch-react-native-screens: Applied Kotlin removeLast() fix.');
  } catch (err) {
    console.warn('patch-react-native-screens: Skipped due to error:', err.message);
  }
}

main();
process.exit(0);
