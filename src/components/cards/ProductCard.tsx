import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.m * 3) / 2;

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AR</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: SPACING.l,
    backgroundColor: COLORS.background,
    // Minimal design often doesn't use shadows on cards, but flat design
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.s,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    paddingHorizontal: SPACING.xs,
  },
  name: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
    fontWeight: '500',
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
