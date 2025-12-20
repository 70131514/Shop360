import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../contexts/ThemeContext';
import {
  clearCart,
  removeFromCart,
  setCartItemQuantity,
  subscribeCart,
} from '../../services/cartService';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem = ({
  id,
  name,
  price,
  image,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Image source={{ uri: image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <ThemedText style={[styles.cartItemName, { color: colors.text }]}>{name}</ThemedText>
        <ThemedText style={[styles.cartItemPrice, { color: colors.text }]}>
          ${price.toFixed(2)}
        </ThemedText>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
            onPress={() => onQuantityChange(id, Math.max(1, quantity - 1))}
          >
            <MaterialIcons name="remove" size={20} color={colors.background} />
          </TouchableOpacity>
          <ThemedText style={[styles.quantityText, { color: colors.text }]}>{quantity}</ThemedText>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
            onPress={() => onQuantityChange(id, quantity + 1)}
          >
            <MaterialIcons name="add" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(id)}>
        <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

export default function CartScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let unsub: undefined | (() => void);
    try {
      unsub = subscribeCart(
        (items) => {
          setCartItems(items);
          setLoading(false);
        },
        () => {
          setCartItems([]);
          setLoading(false);
        },
      );
    } catch {
      // In case auth state is missing unexpectedly
      setCartItems([]);
      setLoading(false);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    // Optimistic UI update; Firestore snapshot will confirm shortly
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)),
    );
    setCartItemQuantity(id, newQuantity).catch(() => {
      // If it fails, the snapshot will re-sync; no-op here
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    removeFromCart(id).catch(() => {
      // Snapshot will re-sync on failure
    });
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );
  const shipping = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const handleClearCart = async () => {
    try {
      setClearing(true);
      await clearCart();
    } finally {
      setClearing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <View
        style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}
      >
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              Shopping Cart
            </ThemedText>
            <ThemedText style={[styles.itemCount, { color: colors.textSecondary }]}>
              {cartItems.length} items
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={handleClearCart}
            disabled={clearing || cartItems.length === 0}
          >
            {clearing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <ThemedText
                style={[
                  styles.clearButtonText,
                  { color: cartItems.length === 0 ? colors.textSecondary : colors.text },
                ]}
              >
                Clear
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.cartList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartListContent}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Loading your cart...
            </ThemedText>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-cart" size={64} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your cart is empty
            </ThemedText>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Products')}
            >
              <ThemedText style={[styles.browseButtonText, { color: colors.background }]}>
                Browse Products
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item.id}
              {...item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Subtotal
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
            ${subtotal.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Shipping
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
            ${shipping.toFixed(2)}
          </ThemedText>
        </View>
        <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.totalLabel, { color: colors.text }]}>Total</ThemedText>
          <ThemedText style={[styles.totalValue, { color: colors.text }]}>
            ${total.toFixed(2)}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Home')}
          disabled={cartItems.length === 0}
        >
          <ThemedText style={[styles.checkoutButtonText, { color: colors.background }]}>
            Proceed to Checkout
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 14,
    fontSize: 15,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItemImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  quantityText: {
    fontSize: 15,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  summaryContainer: {
    borderTopWidth: 1,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  checkoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
