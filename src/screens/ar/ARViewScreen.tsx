import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SPACING } from '../../theme';

export const ARViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { product } = route.params;

  // Mock states for AR interaction
  const [isPlaced, setIsPlaced] = useState(false);

  return (
    <View style={styles.container}>
      {/* Mock Camera View */}
      <View style={styles.cameraPreview}>
        <Text style={styles.cameraPlaceholderText}>Camera View Active</Text>
        {/* Overlay the product image as a "3D model" */}
        <View style={styles.arObjectContainer}>
          <Image source={{ uri: product.image }} style={styles.arObject} resizeMode="contain" />
          <View style={styles.placementRing} />
        </View>
      </View>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <Text style={styles.instructionText}>
            {isPlaced ? 'Drag to move, pinch to scale' : 'Point camera at a flat surface'}
          </Text>

          {!isPlaced && (
            <TouchableOpacity style={styles.placeButton} onPress={() => setIsPlaced(true)}>
              <Text style={styles.placeButtonText}>Place Object</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#333', // Placeholder for actual camera feed
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderText: {
    color: 'rgba(255,255,255,0.3)',
    position: 'absolute',
    top: 100,
  },
  arObjectContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arObject: {
    width: 250,
    height: 250,
    zIndex: 10,
  },
  placementRing: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 100,
    position: 'absolute',
    bottom: -20,
    opacity: 0.5,
    transform: [{ scaleY: 0.3 }], // Make it look like a ring on the floor
    borderStyle: 'dashed',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    padding: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    padding: SPACING.l,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: SPACING.l,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: 100,
  },
  placeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
