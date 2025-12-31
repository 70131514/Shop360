import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getOrderById,
  requestOrderCancellation,
  type Order,
  type OrderStatus,
} from '../../services/orderService';
import { useAppAlert } from '../../contexts/AppAlertContext';

type OrderDetailRouteParams = {
  orderId: string;
};

const OrderDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = (route.params as OrderDetailRouteParams) || {};

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingCancellation, setRequestingCancellation] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    let mounted = true;
    getOrderById(orderId)
      .then((orderData) => {
        if (mounted) {
          if (orderData) {
            setOrder(orderData);
          } else {
            setError('Order not found');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load order');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [orderId]);

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp.toMillis) {
        return new Date(timestamp.toMillis()).toLocaleString();
      }
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const formatTimelineDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      let date: Date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.toMillis) {
        date = new Date(timestamp.toMillis());
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const handleRequestCancellation = () => {
    if (!order || order.status === 'cancelled' || order.status === 'delivered') {
      alert('Cannot Cancel', 'This order cannot be cancelled.');
      return;
    }

    if (order.cancellationRequested) {
      alert('Cancellation Requested', 'You have already requested cancellation for this order. Waiting for admin approval.');
      return;
    }

    alert(
      'Request Cancellation',
      'Are you sure you want to request cancellation for this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setRequestingCancellation(true);
              await requestOrderCancellation(orderId);
              // Refresh order data
              const updatedOrder = await getOrderById(orderId);
              if (updatedOrder) {
                setOrder(updatedOrder);
              }
              alert('Success', 'Cancellation request submitted. Waiting for admin approval.');
            } catch (err) {
              alert('Error', err instanceof Error ? err.message : 'Failed to request cancellation');
            } finally {
              setRequestingCancellation(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
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
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>Loading order…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.helperText, { color: colors.text }]}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Info Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.orderId, { color: colors.text }]}>
                Order #{String(order.id).slice(-8).toUpperCase()}
              </Text>
              <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                Placed on {formatDate(order.createdAt)}
              </Text>
              {order.paymentMethod && (
                <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                  Payment:{' '}
                  {order.paymentMethod === 'cash_on_delivery'
                    ? 'Cash on Delivery'
                    : order.paymentMethod === 'card_payment'
                      ? 'Card Payment'
                      : order.paymentMethod}
                </Text>
              )}
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
            >
              <Text style={styles.statusText}>
                {String(order.status).charAt(0).toUpperCase() + String(order.status).slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items ({order.itemCount})</Text>
          {order.items.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.itemRow}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
              )}
              <View style={styles.itemInfo}>
                {item.brand && (
                  <Text style={[styles.itemBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
                )}
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  Quantity: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  ${Number(item.price).toFixed(2)} each
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <Text style={[styles.itemTotalPrice, { color: colors.text }]}>
                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
          <View style={styles.addressContainer}>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address.name}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address.street}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address.country}</Text>
          </View>
        </View>

        {/* Cancellation Request Status Card */}
        {order.cancellationRequested && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#FF9500' }]}>
            <View style={styles.cancellationHeader}>
              <Ionicons name="time-outline" size={24} color="#FF9500" />
              <Text style={[styles.cancellationTitle, { color: colors.text }]}>
                Cancellation Requested
              </Text>
            </View>
            <Text style={[styles.cancellationText, { color: colors.textSecondary }]}>
              Your cancellation request is pending admin approval.
            </Text>
            {order.cancellationReason && (
              <Text style={[styles.cancellationReason, { color: colors.textSecondary }]}>
                Reason: {order.cancellationReason}
              </Text>
            )}
            {order.cancellationRequestedAt && (
              <Text style={[styles.cancellationDate, { color: colors.textSecondary }]}>
                Requested: {formatDate(order.cancellationRequestedAt)}
              </Text>
            )}
          </View>
        )}

        {order.cancellationRejected && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#FF3B30' }]}>
            <View style={styles.cancellationHeader}>
              <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
              <Text style={[styles.cancellationTitle, { color: colors.text }]}>
                Cancellation Rejected
              </Text>
            </View>
            <Text style={[styles.cancellationText, { color: colors.textSecondary }]}>
              {order.cancellationRejectionReason || 'Your cancellation request was rejected.'}
            </Text>
            {order.cancellationRejectedAt && (
              <Text style={[styles.cancellationDate, { color: colors.textSecondary }]}>
                Rejected: {formatDate(order.cancellationRejectedAt)}
              </Text>
            )}
          </View>
        )}

        {/* Cancel Order Button */}
        {order.status !== 'cancelled' &&
          order.status !== 'delivered' &&
          !order.cancellationRequested && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleRequestCancellation}
                disabled={requestingCancellation}
              >
                {requestingCancellation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.cancelButtonText}>Request Cancellation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

        {/* Summary Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${Number(order.subtotal).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${Number(order.shipping).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              ${Number(order.total).toFixed(2)}
            </Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  paymentMethod: {
    fontSize: 13,
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
  },
  itemTotal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  addressContainer: {
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 20,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 0,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
  },
  timelineNote: {
    fontSize: 13,
    marginTop: 2,
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cancellationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancellationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  cancellationReason: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cancellationDate: {
    fontSize: 12,
    marginTop: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;

