import React, { useEffect, useMemo, useState } from 'react';
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
import { subscribeOrders } from '../../services/orderService';

type OrderStatus = 'delivered' | 'processing' | 'shipped' | 'cancelled';

const OrderHistoryScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    setLoading(true);
    setError(null);

    try {
      unsub = subscribeOrders(
        (next) => {
          setOrders(next || []);
          setError(null);
          setLoading(false);
        },
        (e) => {
          console.error('Order subscription error:', e);
          setError(e instanceof Error ? e.message : 'Failed to load orders');
          setLoading(false);
        },
      );
    } catch (e: any) {
      console.error('Failed to subscribe to orders:', e);
      setError(e?.message ?? 'Failed to load orders');
      setLoading(false);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, []);

  const uiOrders = useMemo(() => {
    return (orders ?? []).map((o: any) => {
      const createdAtMs =
        typeof o?.createdAt?.toMillis === 'function' ? o.createdAt.toMillis() : Date.now();
      return {
        ...o,
        createdAtMs,
        status: (o?.status as OrderStatus) ?? 'processing',
        items: Array.isArray(o?.items) ? o.items : [],
        total: Number(o?.total ?? 0),
      };
    });
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return '#4CD964';
      case 'processing':
        return '#FF9500';
      case 'shipped':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.textSecondary;
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Loading orders…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.helperText, { color: colors.text }]}>{error}</Text>
          </View>
        ) : uiOrders.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="receipt-outline" size={56} color={colors.textSecondary} />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>No orders yet</Text>
          </View>
        ) : (
          uiOrders.map((order: any) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, { backgroundColor: colors.surface }]}
              onPress={() => handleViewOrder(order.id)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: colors.text }]}>
                    Order #{String(order.id).slice(-6).toUpperCase()}
                  </Text>
                  <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                    {new Date(order.createdAtMs).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                >
                  <Text style={styles.statusText}>
                    {String(order.status).charAt(0).toUpperCase() + String(order.status).slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {(order.items ?? []).slice(0, 3).map((item: any) => (
                  <View key={item.productId ?? item.id} style={styles.itemRow}>
                    {!!item.image && (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.itemInfo}>
                      {!!item.brand && (
                        <Text style={[styles.itemBrand, { color: colors.textSecondary }]}>
                          {item.brand}
                        </Text>
                      )}
                      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      ${Number(item.price ?? 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: colors.text }]}>
                    ${Number(order.total ?? 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default OrderHistoryScreen;
