/**
 * metro.config.js
 *
 * React Native 0.72+ requires this format.
 */

const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Viro / 3D assets (glTF binary)
// Ensure Metro bundles .glb files so Viro can load them via `require(...)`.
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts || []), 'glb']));

module.exports = config;
