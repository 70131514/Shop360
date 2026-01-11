import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { getWishlist, removeFromWishlist, WishlistItem } from '../../services/wishlistService';
import { addToCart } from '../../services/cartService';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { getReadableTextColor } from '../../utils/helpers';

const WishlistScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { alert } = useAppAlert();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getWishlist();
      setWishlistItems(items);
    } catch (e) {
      // If user is logged out (or rules deny), wishlist is empty
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load wishlist items on mount + refresh when screen is focused
  useEffect(() => {
    loadWishlist();
    const unsubscribe = navigation.addListener('focus', loadWishlist);
    return unsubscribe;
  }, [navigation, loadWishlist]);

  const handleRemoveItem = async (id: string) => {
    await removeFromWishlist(id);
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveToCart = async (id: string) => {
    const item = wishlistItems.find((w) => w.id === id);
    if (!item) {
      return;
    }
    await addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price ?? 0),
      originalPrice: item.originalPrice,
      image: item.image,
      brand: item.brand,
      inStock: item.inStock,
    });
    alert('Added to cart', `${item.name} has been added to your cart.`);
    await handleRemoveItem(id);
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wishlist</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Loading wishlist...</Text>
            </View>
          ) : wishlistItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={colors.text} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Your wishlist is empty</Text>
              <TouchableOpacity
                style={[styles.browseButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Products')}
              >
                <Text
                  style={[styles.browseButtonText, { color: getReadableTextColor(colors.primary) }]}
                >
                  Browse Products
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            wishlistItems.map((item) => {
              const price = Number(item.price ?? 0);
              const originalPrice = Number(item.originalPrice ?? 0);
              const moveBg = item.inStock ? colors.primary : colors.textSecondary;
              const removeBg = '#FF3B30';
              const moveText = getReadableTextColor(moveBg);
              const removeText = getReadableTextColor(removeBg);

              return (
                <View
                  key={item.id}
                  style={[styles.itemContainer, { backgroundColor: colors.surface }]}
                >
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemBrand, { color: colors.text }]}>{item.brand}</Text>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>${price}</Text>
                      {originalPrice > price && (
                        <Text style={[styles.originalPrice, { color: colors.text }]}>
                          ${originalPrice}
                        </Text>
                      )}
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.moveToCartButton, { backgroundColor: moveBg }]}
                        onPress={() => handleMoveToCart(item.id)}
                        disabled={!item.inStock}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            !item.inStock ? styles.buttonTextDisabled : null,
                            { color: moveText },
                          ]}
                        >
                          {item.inStock ? 'Move to Cart' : 'Out of Stock'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: removeBg }]}
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        <Text style={[styles.buttonText, { color: removeText }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemBrand: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.7,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  moveToCartButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

export default WishlistScreen;
