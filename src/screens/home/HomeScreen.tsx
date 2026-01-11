import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { ThemedText } from '../../components/ThemedText';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeFeaturedProducts,
  subscribeNewArrivals,
  subscribeBestSellers,
  type StoreProduct,
} from '../../services/productCatalogService';
import { getAvatarSourceForUser } from '../../utils/avatarUtils';

// Define types for props
interface FeatureSectionProps {
  title: string;
  description: string;
  iconType: 'sf' | 'ionicon';
  sfIconName?:
    | 'house.fill'
    | 'paperplane.fill'
    | 'chevron.left.forwardslash.chevron.right'
    | 'chevron.right';
  ionIconName?: string;
}

interface FeaturedProductProps {
  title: string;
  image: string;
  price: string;
}

// Minimal feature section component
const FeatureSection = ({
  title,
  description,
  iconType,
  sfIconName,
  ionIconName,
}: FeatureSectionProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.featureCard}>
      {iconType === 'ionicon' ? (
        <Ionicons
          name={ionIconName as any}
          size={28}
          color={colors.primary}
          style={styles.featureIcon}
        />
      ) : (
        <IconSymbol
          size={28}
          name={sfIconName!}
          color={colors.primary}
          style={styles.featureIcon}
        />
      )}
      <ThemedText style={[styles.featureTitle, { color: colors.text }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </ThemedText>
    </View>
  );
};

// Featured product component
const FeaturedProduct = ({
  product,
}: {
  product: StoreProduct;
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const discountedPrice =
    product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;

  return (
    <TouchableOpacity
      style={[styles.featuredProductCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ProductDetails', { id: product.id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: product.thumbnail || '' }}
        style={styles.featuredProductImage}
      />
      <View style={styles.featuredProductInfo}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.featuredProductTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.title}
        </ThemedText>
        <View style={styles.featuredProductPriceRow}>
          <ThemedText style={[styles.featuredProductPrice, { color: colors.primary }]}>
            ${discountedPrice.toFixed(2)}
          </ThemedText>
          {product.discountPercentage > 0 && (
            <ThemedText
              style={[
                styles.featuredProductOriginalPrice,
                { color: colors.textSecondary },
              ]}
            >
              ${product.price.toFixed(2)}
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, profile, isAdmin } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [newArrivals, setNewArrivals] = useState<StoreProduct[]>([]);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [bestSellers, setBestSellers] = useState<StoreProduct[]>([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);

  // Get avatar source for the user
  const avatarSource = getAvatarSourceForUser({
    avatarId: profile?.avatarId,
    isGuest: !user,
    isAdmin: isAdmin,
  });

  useEffect(() => {
    const unsub = subscribeFeaturedProducts(
      (products) => {
        setFeaturedProducts(products);
        setLoadingFeatured(false);
      },
      (err) => {
        console.warn('Featured products subscription error (handled):', err);
        setLoadingFeatured(false);
        setFeaturedProducts([]);
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeNewArrivals(
      (products) => {
        setNewArrivals(products);
        setLoadingNewArrivals(false);
      },
      (err) => {
        console.warn('New arrivals subscription error (handled):', err);
        setLoadingNewArrivals(false);
        setNewArrivals([]);
      },
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeBestSellers(
      (products) => {
        setBestSellers(products);
        setLoadingBestSellers(false);
      },
      (err) => {
        console.warn('Best sellers subscription error (handled):', err);
        setLoadingBestSellers(false);
        setBestSellers([]);
      },
    );
    return unsub;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>
                {user && profile?.name
                  ? `Hi, ${profile.name.split(' ')[0]}`
                  : user
                  ? 'Welcome back'
                  : 'Welcome'}
              </ThemedText>
              <ThemedText type="title" style={[styles.appName, { color: colors.text }]}>
                Shop360°
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[
                styles.profileButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
            >
              <Image source={avatarSource} style={styles.avatarImage} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner */}
        <View style={[styles.bannerContainer, { borderColor: colors.border }]}>
          <Image
            source={{
              uri: 'https://images.ctfassets.net/wp1lcwdav1p1/2bzxvC8K1Cv0OMSQEA7p9l/eaa3de48c71d61a4a7d9c064d7235db6/GettyImages-1351925376.jpg?w=1500&h=680&q=60&fit=fill&f=faces&fm=jpg&fl=progressive',
            }}
            style={styles.bannerImage}
          />
          <View style={[styles.bannerOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <ThemedText type="title" style={styles.bannerTitle}>
              View in AR
            </ThemedText>
            <ThemedText style={styles.bannerSubtitle}>Experience products in your space</ThemedText>
            <TouchableOpacity
              style={[
                styles.bannerButton,
                {
                  backgroundColor: isDark ? colors.primary : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => navigation.navigate('Products')}
            >
              <ThemedText
                style={[
                  styles.bannerButtonText,
                  {
                    color: isDark ? colors.background : colors.primary,
                  },
                ]}
              >
                Explore Now
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Why Shop With Us
          </ThemedText>
        </View>

        <View style={styles.featuresContainer}>
          <FeatureSection
            title="AR Experience"
            description="Try products in your space"
            iconType="ionicon"
            ionIconName="cube-outline"
          />
          <FeatureSection
            title="Precise Details"
            description="Exact dimensions and specs"
            iconType="ionicon"
            ionIconName="scan-outline"
          />
          <FeatureSection
            title="Smart Shopping"
            description="Intelligent recommendations"
            iconType="ionicon"
            ionIconName="sparkles-outline"
          />
        </View>

        {/* Featured products */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Featured Products
          </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('Products')} activeOpacity={0.7}>
            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loadingFeatured ? (
          <View style={styles.featuredLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ThemedText style={[styles.featuredLoadingText, { color: colors.textSecondary }]}>
              Loading featured products...
            </ThemedText>
          </View>
        ) : featuredProducts.length === 0 ? (
          <View style={styles.featuredEmptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
            <ThemedText style={[styles.featuredEmptyText, { color: colors.textSecondary }]}>
              No featured products yet
            </ThemedText>
            <ThemedText style={[styles.featuredEmptySubtext, { color: colors.textSecondary }]}>
              Mark products as featured in admin to see them here
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredProductsContainer}
            contentContainerStyle={styles.featuredProductsContent}
          >
            {featuredProducts.map((product) => (
              <FeaturedProduct key={product.id} product={product} />
            ))}
          </ScrollView>
        )}

        {/* New Arrivals */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            New Arrivals
          </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('Products')} activeOpacity={0.7}>
            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loadingNewArrivals ? (
          <View style={styles.featuredLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ThemedText style={[styles.featuredLoadingText, { color: colors.textSecondary }]}>
              Loading new arrivals...
            </ThemedText>
          </View>
        ) : newArrivals.length === 0 ? (
          <View style={styles.featuredEmptyContainer}>
            <Ionicons name="sparkles-outline" size={48} color={colors.textSecondary} />
            <ThemedText style={[styles.featuredEmptyText, { color: colors.textSecondary }]}>
              No new arrivals yet
            </ThemedText>
            <ThemedText style={[styles.featuredEmptySubtext, { color: colors.textSecondary }]}>
              Mark products as new arrivals in admin to see them here
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredProductsContainer}
            contentContainerStyle={styles.featuredProductsContent}
          >
            {newArrivals.map((product) => (
              <FeaturedProduct key={product.id} product={product} />
            ))}
          </ScrollView>
        )}

        {/* Best Sellers */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Best Sellers
          </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('Products')} activeOpacity={0.7}>
            <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </View>

        {loadingBestSellers ? (
          <View style={styles.featuredLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <ThemedText style={[styles.featuredLoadingText, { color: colors.textSecondary }]}>
              Loading best sellers...
            </ThemedText>
          </View>
        ) : bestSellers.length === 0 ? (
          <View style={styles.featuredEmptyContainer}>
            <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
            <ThemedText style={[styles.featuredEmptyText, { color: colors.textSecondary }]}>
              No best sellers yet
            </ThemedText>
            <ThemedText style={[styles.featuredEmptySubtext, { color: colors.textSecondary }]}>
              Mark products as best sellers in admin to see them here
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredProductsContainer}
            contentContainerStyle={styles.featuredProductsContent}
          >
            {bestSellers.map((product) => (
              <FeaturedProduct key={product.id} product={product} />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Account for tab bar
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 2,
    opacity: 0.8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bannerContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    marginBottom: 32,
    position: 'relative',
    borderWidth: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  bannerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    flex: 1,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
    gap: 16,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  featuredProductsContainer: {
    marginBottom: 32,
  },
  featuredProductsContent: {
    paddingHorizontal: 20,
  },
  featuredProductCard: {
    width: width * 0.6,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  featuredProductImage: {
    width: '100%',
    height: 200,
  },
  featuredProductInfo: {
    padding: 16,
  },
  featuredProductTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  featuredProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredProductPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  featuredProductOriginalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  featuredLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredLoadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  featuredEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  featuredEmptySubtext: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
