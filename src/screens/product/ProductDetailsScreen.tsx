import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import {
  addToWishlist,
  isWishlisted as isWishlistedRemote,
  removeFromWishlist,
  WishlistItem,
} from '../../services/wishlistService';
import { addToCart } from '../../services/cartService';
import {
  subscribeProductById,
  getProductsByCategory,
  type StoreProduct,
} from '../../services/productCatalogService';

// Define the Product type
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
  rating: number;
  discountPercentage: number;
  stock: number;
  brand: string;
  modelUrl?: string;
}

const { width } = Dimensions.get('window');

type RootStackParamList = {
  ProductDetails: { id: string };
};
type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen() {
  const route = useRoute<ProductDetailsRouteProp>();
  const { id } = route.params || {}; // Handle undefined params safely
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, refreshEmailVerification, isAdmin } = useAuth();
  const { alert } = useAppAlert();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const mapStoreProductToProduct = useCallback((p: StoreProduct | null): Product | null => {
    if (!p) return null;
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      description: p.description,
      thumbnail: p.thumbnail,
      images: p.images,
      rating: p.rating,
      discountPercentage: p.discountPercentage,
      stock: p.stock,
      brand: p.brand,
      modelUrl: p.modelUrl,
    };
  }, []);

  const checkWishlistStatus = useCallback(async () => {
    try {
      setIsWishlisted(await isWishlistedRemote(id));
    } catch {
      // If user is not logged in or network fails, default to false
      setIsWishlisted(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('No product ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time product updates
    // This listener automatically updates when:
    // - Stock is deducted during order placement (via Firestore transaction)
    // - Admin updates product stock
    // - Product details are modified
    // The UI will update immediately without manual refresh
    const unsubscribe = subscribeProductById(
      String(id),
      (productData) => {
        if (productData) {
          const mapped = mapStoreProductToProduct(productData);
          if (mapped) {
            setProduct(mapped);
            setError(null);
            // Stock updates are reflected immediately via this subscription
          } else {
            setError('Product not found');
            setProduct(null);
          }
        } else {
          setError('Product not found');
          setProduct(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading product:', err);
        setError('Failed to load product. Please try again.');
        setLoading(false);
      },
    );

    // Check wishlist status
    checkWishlistStatus();

    return () => {
      unsubscribe();
    };
  }, [id, mapStoreProductToProduct, checkWishlistStatus]);

  useEffect(() => {
    // Reset quantity when product changes
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    // Fetch "similar" items by category (best-effort)
    let alive = true;
    const loadRelated = async () => {
      if (!product?.category) {
        setRelated([]);
        return;
      }
      try {
        setLoadingRelated(true);
        const list = await getProductsByCategory({
          category: product.category,
          excludeId: product.id,
          max: 12,
        });
        const filtered = list.slice(0, 10).map(
          (p: StoreProduct): Product => ({
            id: p.id,
            title: p.title,
            price: p.price,
            category: p.category,
            description: p.description,
            thumbnail: p.thumbnail,
            images: p.images,
            rating: p.rating,
            discountPercentage: p.discountPercentage,
            stock: p.stock,
            brand: p.brand,
          }),
        );
        if (alive) {
          setRelated(filtered);
        }
      } catch {
        if (alive) {
          setRelated([]);
        }
      } finally {
        if (alive) {
          setLoadingRelated(false);
        }
      }
    };
    loadRelated();
    return () => {
      alive = false;
    };
  }, [product?.category, product?.id]);

  const toggleWishlist = async () => {
    try {
      if (!user) {
        alert('Sign in required', 'Please sign in to use wishlist.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
          { text: 'Sign Up', onPress: () => navigation.navigate('Signup') },
        ]);
        return;
      }

      if (!user.emailVerified) {
        alert(
          'Verify your email',
          'Please verify your email to use wishlist. Check your inbox, then tap “I verified”.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'I verified',
              onPress: async () => {
                try {
                  await refreshEmailVerification();
                } catch {
                  // ignore
                }
              },
            },
          ],
        );
        return;
      }

      if (isWishlisted) {
        await removeFromWishlist(String(id));
        setIsWishlisted(false);
      } else if (product) {
        // Add to wishlist
        const newItem: WishlistItem = {
          id: product.id,
          name: product.title,
          brand: product.brand,
          price: product.price,
          originalPrice: product.price * 1.2, // 20% higher as original price
          image: product.images[0],
          inStock: product.stock > 0,
        };
        await addToWishlist(newItem);
        setIsWishlisted(true);
        alert('Added to wishlist', `${product.title} has been added to your wishlist.`);
      }
    } catch (e: any) {
      alert('Wishlist update failed', e?.message ?? 'Please try again.');
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    // Real-time stock check - product stock is updated via subscribeProductById
    if (product.stock <= 0) {
      alert('Out of Stock', 'This product is currently out of stock.', [{ text: 'OK' }]);
      return;
    }
    if (quantity > product.stock) {
      alert('Insufficient Stock', `Only ${product.stock} item(s) available in stock.`, [
        { text: 'OK' },
      ]);
      return;
    }
    // Additional validation: ensure quantity is positive
    if (quantity <= 0) {
      alert('Invalid Quantity', 'Please select a valid quantity.', [{ text: 'OK' }]);
      return;
    }

    try {
      const discountedPrice =
        product.discountPercentage > 0
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price;

      setAddingToCart(true);
      await addToCart({
        id: product.id,
        name: product.title,
        price: Number(discountedPrice),
        originalPrice: product.discountPercentage > 0 ? product.price : undefined,
        image: product.images?.[0] || product.thumbnail,
        brand: product.brand,
        quantity,
        inStock: product.stock > 0,
        stock: product.stock,
      });
      alert('Added to cart', `${product.title} (x${quantity}) has been added to your cart.`);
    } catch (e: any) {
      alert('Could not add to cart', e?.message ?? 'Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const discountedUnitPrice =
    product && product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : product?.price ?? 0;
  const lineTotal = Number(discountedUnitPrice) * Math.max(1, Number(quantity || 1));

  const canDecreaseQty = quantity > 1;
  const canIncreaseQty = !!product && quantity < Math.max(1, Math.min(10, product.stock || 1));

  const changeImage = (direction: 'next' | 'prev') => {
    if (!product) {
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const imageCount = product.images && product.images.length > 0 ? product.images.length : 1;
    if (direction === 'next' && activeImage < imageCount - 1) {
      setActiveImage(activeImage + 1);
    } else if (direction === 'prev' && activeImage > 0) {
      setActiveImage(activeImage - 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Product not found'}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Custom Header */}
      <View
        style={[
          styles.customHeader,
          { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 0) + 10 },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {product.title}
        </Text>

        <View style={styles.headerRightButtons}>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.primary, marginRight: 8 }]}
              onPress={() => navigation.navigate('AdminProductEdit', { id: product.id })}
            >
              <Ionicons name="create-outline" size={22} color={colors.background} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={toggleWishlist}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.imageGallery, { backgroundColor: colors.surface }]}>
          <Animated.Image
            source={{ uri: product.images[activeImage] || product.thumbnail }}
            style={[styles.mainImage, { opacity: fadeAnim }]}
            resizeMode="cover"
          />
          {product.discountPercentage > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.discountText, { color: colors.background }]}>
                {Math.round(product.discountPercentage)}% OFF
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.fullScreenButton, { backgroundColor: colors.surface }]}
            onPress={() => setIsFullScreen(true)}
          >
            <Ionicons name="expand-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {activeImage > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.leftButton, { backgroundColor: colors.surface }]}
              onPress={() => changeImage('prev')}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          {activeImage < product.images.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.rightButton, { backgroundColor: colors.surface }]}
              onPress={() => changeImage('next')}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailScroll}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {(product.images && product.images.length > 0 ? product.images : [product.thumbnail]).map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveImage(index)}
              style={[
                styles.thumbnailWrapper,
                { backgroundColor: colors.surface },
                activeImage === index && { borderColor: colors.primary },
              ]}
            >
              <Image source={{ uri: image }} style={styles.thumbnail} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.infoContainer}>
          <View style={styles.brandRow}>
            <Text style={[styles.brand, { color: colors.text }]}>{product.brand}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={[styles.rating, { color: colors.text }]}>{product.rating}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>

          <View style={styles.priceContainer}>
            {product.discountPercentage > 0 ? (
              <>
                <Text style={[styles.price, { color: colors.text }]}>
                  ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                </Text>
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  ${product.price.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={[styles.price, { color: colors.text }]}>
                ${product.price.toFixed(2)}
              </Text>
            )}
          </View>

          <Text style={[styles.stockInfo, { color: colors.textSecondary }]}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </Text>

          {/* Purchase controls */}
          <View style={[styles.purchaseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.purchaseRow}>
              <Text style={[styles.purchaseLabel, { color: colors.textSecondary }]}>Quantity</Text>
              <View style={[styles.qtyStepper, { borderColor: colors.border }]}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => canDecreaseQty && setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!canDecreaseQty}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={canDecreaseQty ? colors.text : colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => canIncreaseQty && setQuantity((q) => q + 1)}
                  disabled={!canIncreaseQty}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={canIncreaseQty ? colors.text : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.purchaseRow}>
              <Text style={[styles.purchaseLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.purchaseTotal, { color: colors.text }]}>
                ${Number(lineTotal).toFixed(2)}
              </Text>
            </View>
            <Text style={[styles.purchaseHint, { color: colors.textSecondary }]}>
              Tip: You can add up to 10 units per item.
            </Text>
          </View>

          <Text style={[styles.descriptionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>

          {/* Delivery & returns */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoRowTitle, { color: colors.text }]}>Secure checkout</Text>
                <Text style={[styles.infoRowSub, { color: colors.textSecondary }]}>
                  Encrypted payments & protected orders
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={18} color={colors.text} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoRowTitle, { color: colors.text }]}>Fast delivery</Text>
                <Text style={[styles.infoRowSub, { color: colors.textSecondary }]}>
                  Estimated 2–5 business days
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginBottom: 0 }]}>
              <Ionicons name="refresh-outline" size={18} color={colors.text} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoRowTitle, { color: colors.text }]}>Easy returns</Text>
                <Text style={[styles.infoRowSub, { color: colors.textSecondary }]}>
                  7-day return window (unused items)
                </Text>
              </View>
            </View>
          </View>

          {/* Similar items */}
          <View style={styles.similarHeader}>
            <Text style={[styles.similarTitle, { color: colors.text }]}>You may also like</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')} activeOpacity={0.8}>
              <Text style={[styles.similarLink, { color: colors.textSecondary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
            {loadingRelated ? (
              <View style={styles.similarSkeleton}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : related.length === 0 ? (
              <Text style={[styles.similarEmpty, { color: colors.textSecondary }]}>
                No similar products found.
              </Text>
            ) : (
              related.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.9}
                  style={[styles.similarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('ProductDetails', { id: p.id })}
                >
                  <Image source={{ uri: p.thumbnail }} style={styles.similarImage} />
                  <Text style={[styles.similarName, { color: colors.text }]} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <Text style={[styles.similarPrice, { color: colors.textSecondary }]}>
                    ${Number(p.price ?? 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        {product.modelUrl && (
          <TouchableOpacity
            style={[styles.arButton, { backgroundColor: colors.surface }]}
            onPress={() =>
              navigation.navigate('ARView', {
                productId: product.id,
              })
            }
          >
            <Ionicons name="cube-outline" size={20} color={colors.text} />
            <Text style={[styles.arButtonText, { color: colors.text }]}>View in AR</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
          disabled={addingToCart || (product?.stock ?? 0) <= 0}
        >
          <Ionicons name="cart-outline" size={20} color={colors.background} />
          <Text style={[styles.addToCartButtonText, { color: colors.background }]}>
            Add x{quantity}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: colors.surface, top: Math.max(insets.top, 0) + 12 },
              ]}
              onPress={() => setIsFullScreen(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <Animated.Image
              source={{ uri: product.images[activeImage] || product.thumbnail }}
              style={[styles.fullScreenImage, { opacity: fadeAnim }]}
              resizeMode="contain"
            />

            {activeImage > 0 && (
              <TouchableOpacity
                style={[
                  styles.modalNavButton,
                  styles.modalLeftButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => changeImage('prev')}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}

            {activeImage < product.images.length - 1 && (
              <TouchableOpacity
                style={[
                  styles.modalNavButton,
                  styles.modalRightButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => changeImage('next')}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Fixed bottom padding for footer
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '400',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageGallery: {
    width: '100%',
    height: width * 0.8, // Slightly reduced height
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    elevation: 3,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  thumbnailScroll: {
    marginTop: 12,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 26,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '400',
    textDecorationLine: 'line-through',
  },
  stockInfo: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  purchaseCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  purchaseLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  purchaseTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  purchaseHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  infoRowText: {
    flex: 1,
  },
  infoRowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoRowSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  similarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  similarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  similarLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  similarRow: {
    paddingBottom: 6,
    gap: 12,
  },
  similarSkeleton: {
    height: 150,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  similarEmpty: {
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 8,
  },
  similarCard: {
    width: 150,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  similarImage: {
    width: '100%',
    height: 88,
    borderRadius: 10,
    marginBottom: 10,
  },
  similarName: {
    fontSize: 13,
    fontWeight: '800',
  },
  similarPrice: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  arButton: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
    elevation: 2,
  },
  arButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addToCartButton: {
    flex: 2,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
    elevation: 4,
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  leftButton: {
    left: 12,
  },
  rightButton: {
    right: 12,
  },
  fullScreenButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    elevation: 5,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  modalNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalLeftButton: {
    left: 16,
  },
  modalRightButton: {
    right: 16,
  },
});
