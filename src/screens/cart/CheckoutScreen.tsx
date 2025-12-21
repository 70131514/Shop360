import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { subscribeMyAddresses, type Address } from '../../services/addressService';
import { placeOrderFromCart } from '../../services/orderService';
import type { CartItem } from '../../services/cartService';

const CheckoutScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { alert } = useAppAlert();
  const cartItems: CartItem[] = route.params?.cartItems || [];
  const shipping: number = route.params?.shipping || 0;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const unsubscribe = subscribeMyAddresses(
        (addressList) => {
          setAddresses(addressList);
          // Auto-select default address if available
          const defaultAddr = addressList.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          } else if (addressList.length > 0) {
            setSelectedAddress(addressList[0]);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error loading addresses:', error);
          setLoading(false);
        },
      );

      return () => {
        unsubscribe();
      };
    }, []),
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Address Required', 'Please select a delivery address.');
      return;
    }

    try {
      setPlacingOrder(true);
      const { orderId } = await placeOrderFromCart(cartItems, {
        shipping,
        address: {
          name: selectedAddress.name,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
        },
      });
      alert('Order placed', `Your order #${orderId.slice(-6).toUpperCase()} was created.`);
      navigation.navigate('Profile');
    } catch (e: any) {
      alert('Checkout failed', e?.message ?? 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Checkout</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Delivery Address</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No addresses saved</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Please add an address to continue
            </Text>
            <TouchableOpacity
              style={[styles.addAddressButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                navigation.navigate('AddressForm', { returnToCheckout: true });
              }}
            >
              <Ionicons name="add" size={20} color={colors.background} />
              <Text style={[styles.addAddressButtonText, { color: colors.background }]}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selectedAddress?.id === address.id ? colors.primary : colors.border,
                    borderWidth: selectedAddress?.id === address.id ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedAddress(address)}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressTitleRow}>
                      <Text style={[styles.addressName, { color: colors.text }]}>{address.name}</Text>
                      {address.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.defaultBadgeText, { color: colors.background }]}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.addressText, { color: colors.text }]}>{address.street}</Text>
                    <Text style={[styles.addressText, { color: colors.text }]}>
                      {address.city}, {address.state} {address.zipCode}
                    </Text>
                    <Text style={[styles.addressText, { color: colors.text }]}>{address.country}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      {
                        borderColor: selectedAddress?.id === address.id ? colors.primary : colors.border,
                        backgroundColor: selectedAddress?.id === address.id ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {selectedAddress?.id === address.id && (
                      <View style={[styles.radioInner, { backgroundColor: colors.background }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.addNewButton, { borderColor: colors.border }]}
              onPress={() => {
                navigation.navigate('AddressForm', { returnToCheckout: true });
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.addNewButtonText, { color: colors.primary }]}>Add New Address</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${shipping.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: selectedAddress ? colors.primary : colors.border },
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedAddress || placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.placeOrderButtonText, { color: colors.background }]}>Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addAddressButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    marginRight: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  addNewButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
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
  placeOrderButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;

