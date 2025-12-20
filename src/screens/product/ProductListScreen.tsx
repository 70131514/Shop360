import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { addToCart } from '../../services/cartService';
import { useAppAlert } from '../../contexts/AppAlertContext';

// Define types for the product data
interface Product {
  id: number;
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
}

interface Category {
  name: string;
  image: string;
  productCount: number;
}

const ProductListScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { alert } = useAppAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const [addingId, setAddingId] = useState<string | null>(null);

  // Minimal filters (apply only in the selected category list)
  type SortBy = 'relevance' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'discountDesc';
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<string>(''); // optional
  const [maxPrice, setMaxPrice] = useState<string>(''); // optional
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://dummyjson.com/products?limit=200');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate data structure
      if (!data || !data.products || !Array.isArray(data.products)) {
        throw new Error('Invalid data structure received');
      }

      console.log('Fetched Products:', data.products.length);
      setProducts(data.products);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    let results = [...products];

    if (selectedCategory) {
      results = results.filter((product) => product.category === selectedCategory);

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        results = results.filter((product) => {
          const titleMatch = product.title?.toLowerCase().includes(query) || false;
          const brandMatch = product.brand?.toLowerCase().includes(query) || false;
          const descriptionMatch = product.description?.toLowerCase().includes(query) || false;
          return titleMatch || brandMatch || descriptionMatch;
        });
      }

      // Apply minimal filters in the list view
      if (inStockOnly) {
        results = results.filter((p) => Number(p.stock ?? 0) > 0);
      }
      if (discountOnly) {
        results = results.filter((p) => Number(p.discountPercentage ?? 0) > 0);
      }
      if (minRating > 0) {
        results = results.filter((p) => Number(p.rating ?? 0) >= minRating);
      }
      const minP = Number(String(minPrice).trim());
      const maxP = Number(String(maxPrice).trim());
      const hasMin = String(minPrice).trim().length > 0 && !Number.isNaN(minP);
      const hasMax = String(maxPrice).trim().length > 0 && !Number.isNaN(maxP);
      if (hasMin) {
        results = results.filter((p) => Number(p.price ?? 0) >= minP);
      }
      if (hasMax) {
        results = results.filter((p) => Number(p.price ?? 0) <= maxP);
      }

      // Sort
      const byDiscountedPrice = (p: Product) =>
        Number(
          (p.discountPercentage ?? 0) > 0
            ? p.price * (1 - (p.discountPercentage ?? 0) / 100)
            : p.price,
        );
      if (sortBy === 'priceAsc') {
        results.sort((a, b) => byDiscountedPrice(a) - byDiscountedPrice(b));
      } else if (sortBy === 'priceDesc') {
        results.sort((a, b) => byDiscountedPrice(b) - byDiscountedPrice(a));
      } else if (sortBy === 'ratingDesc') {
        results.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
      } else if (sortBy === 'discountDesc') {
        results.sort(
          (a, b) => Number(b.discountPercentage ?? 0) - Number(a.discountPercentage ?? 0),
        );
      }
    }

    return results;
  }, [
    products,
    searchQuery,
    selectedCategory,
    inStockOnly,
    discountOnly,
    minRating,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const handleAddToCart = async (product: Product) => {
    try {
      const discountedPrice =
        product.discountPercentage > 0
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price;

      setAddingId(product.id.toString());
      await addToCart({
        id: product.id.toString(),
        name: product.title,
        price: Number(discountedPrice),
        originalPrice: product.discountPercentage > 0 ? product.price : undefined,
        image: product.thumbnail,
        brand: product.brand,
        inStock: (product.stock ?? 0) > 0,
      });
      alert('Added to cart', `${product.title} has been added to your cart.`);
    } catch (e: any) {
      alert('Could not add to cart', e?.message ?? 'Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  // Memoized categories for better performance
  const categories = useMemo((): Category[] => {
    if (products.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, { count: number; image: string }>();

    products.forEach((product) => {
      if (product.category) {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            count: 1,
            image: product.thumbnail || '',
          });
        } else {
          const current = categoryMap.get(product.category)!;
          categoryMap.set(product.category, {
            count: current.count + 1,
            image: current.image || product.thumbnail || '',
          });
        }
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, { count, image }]) => ({
        name,
        image,
        productCount: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    // Reset filters when leaving the list for a predictable UX
    setSortBy('relevance');
    setInStockOnly(false);
    setDiscountOnly(false);
    setMinRating(0);
    setMinPrice('');
    setMaxPrice('');
  };

  const resetFilters = () => {
    setSortBy('relevance');
    setInStockOnly(false);
    setDiscountOnly(false);
    setMinRating(0);
    setMinPrice('');
    setMaxPrice('');
  };

  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (discountOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (String(minPrice).trim() ? 1 : 0) +
    (String(maxPrice).trim() ? 1 : 0) +
    (sortBy !== 'relevance' ? 1 : 0);

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedCategory(item.name)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>
          {item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ')}
        </Text>
        <Text style={styles.categoryCount}>{item.productCount} items</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const discountedPrice =
      item.discountPercentage > 0 ? item.price * (1 - item.discountPercentage / 100) : item.price;

    const isOutOfStock = (item.stock ?? 0) <= 0;
    const isAdding = addingId === item.id.toString();

    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('ProductDetails', { id: item.id.toString() })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.productImage} />
          {item.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{Math.round(item.discountPercentage)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.brandText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.brand || 'No Brand'}
          </Text>
          <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {item.discountPercentage > 0 && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ${item.price.toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={[styles.stockText, { color: colors.textSecondary }]}>
              • {item.stock || 0} left
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            {
              backgroundColor: isOutOfStock ? colors.textSecondary : colors.primary,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            if (isOutOfStock || isAdding) {
              return;
            }
            handleAddToCart(item);
          }}
          activeOpacity={0.7}
          disabled={isOutOfStock || isAdding}
        >
          <Ionicons name={isAdding ? 'time-outline' : 'add'} size={20} color={colors.surface} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchProducts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            paddingTop: Math.max(insets.top, 0) + 10,
          },
        ]}
      >
        {selectedCategory ? (
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={clearCategory}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButtonPlaceholder} />
        )}

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {selectedCategory
            ? selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1).replace(/-/g, ' ')
            : 'Categories'}
        </Text>
      </View>

      {selectedCategory && (
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search in category..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Minimal filter row (only in product list) */}
      {selectedCategory && (
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setFiltersOpen(true)}
            >
              <Ionicons name="options-outline" size={16} color={colors.text} />
              <Text style={[styles.filterChipText, { color: colors.text }]}>
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setSortBy((v) => (v === 'priceAsc' ? 'relevance' : 'priceAsc'))}
            >
              <Ionicons name="arrow-up-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Price ↑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setInStockOnly((v) => !v)}
            >
              <Ionicons
                name={inStockOnly ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={16}
                color={inStockOnly ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>In stock</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {selectedCategory ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={styles.categoryList}
          columnWrapperStyle={styles.categoryRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filters modal */}
      <Modal
        visible={filtersOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity onPress={resetFilters} activeOpacity={0.8}>
                <Text style={[styles.modalAction, { color: colors.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Sort</Text>
              {(
                [
                  { key: 'relevance', label: 'Relevance' },
                  { key: 'priceAsc', label: 'Price: Low → High' },
                  { key: 'priceDesc', label: 'Price: High → Low' },
                  { key: 'ratingDesc', label: 'Rating' },
                  { key: 'discountDesc', label: 'Discount' },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.85}
                  style={[styles.modalOption, { borderColor: colors.border }]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{opt.label}</Text>
                  <Ionicons
                    name={sortBy === opt.key ? 'checkmark' : 'chevron-forward'}
                    size={18}
                    color={sortBy === opt.key ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Availability</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={() => setInStockOnly((v) => !v)}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>In stock only</Text>
                <Ionicons
                  name={inStockOnly ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={inStockOnly ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={() => setDiscountOnly((v) => !v)}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Discounted only
                </Text>
                <Ionicons
                  name={discountOnly ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={discountOnly ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Minimum rating
              </Text>
              <View style={styles.ratingRow}>
                {[0, 3, 4, 4.5].map((r) => (
                  <TouchableOpacity
                    key={String(r)}
                    activeOpacity={0.85}
                    style={[
                      styles.ratingPill,
                      {
                        backgroundColor: minRating === r ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setMinRating(r)}
                  >
                    <Text
                      style={[
                        styles.ratingPillText,
                        { color: minRating === r ? colors.background : colors.text },
                      ]}
                    >
                      {r === 0 ? 'Any' : `${r}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Price range</Text>
              <View style={styles.priceRow}>
                <View
                  style={[
                    styles.priceInputWrap,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.pricePrefix, { color: colors.textSecondary }]}>$</Text>
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholder="Min"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: colors.text }]}
                  />
                </View>
                <View
                  style={[
                    styles.priceInputWrap,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.pricePrefix, { color: colors.textSecondary }]}>$</Text>
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholder="Max"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    style={[styles.priceInput, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.modalDone, { backgroundColor: colors.primary }]}
              onPress={() => setFiltersOpen(false)}
            >
              <Text style={[styles.modalDoneText, { color: colors.background }]}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterChips: {
    paddingRight: 10,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    maxHeight: '86%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSection: {
    marginTop: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalOption: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  ratingPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ratingPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricePrefix: {
    fontWeight: '800',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    padding: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  modalDone: {
    marginTop: 12,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontSize: 15,
    fontWeight: '900',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 8,
    marginRight: -4,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  categoryRow: {
    justifyContent: 'space-between',
  },
  productList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    aspectRatio: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFF',
    opacity: 0.9,
  },
  productCard: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productInfo: {
    padding: 16,
    paddingBottom: 20,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductListScreen;
