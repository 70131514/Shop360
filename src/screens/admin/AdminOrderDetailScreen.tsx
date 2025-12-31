import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOrderByIdForAdmin,
  updateOrderStatus,
  approveOrderCancellation,
  rejectOrderCancellation,
  markOrderAsViewed,
  type OrderStatus,
} from '../../services/admin/adminService';

type AdminOrderDetailRouteParams = {
  orderId: string;
  userId: string;
};

const AdminOrderDetailScreen = () => {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, userId } = (route.params as AdminOrderDetailRouteParams) || {};

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    if (!orderId || !userId) {
      setError('Order ID and User ID are required');
      setLoading(false);
      return;
    }

    let mounted = true;
    getOrderByIdForAdmin(orderId, userId)
      .then(async (orderData) => {
        if (mounted) {
          if (orderData) {
            setOrder(orderData);
            // Mark order as viewed when admin opens it
            if (!orderData.viewedByAdmin) {
              try {
                await markOrderAsViewed(orderId, userId);
              } catch (err) {
                console.error('Failed to mark order as viewed:', err);
              }
            }
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
  }, [orderId, userId, isAdmin]);

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

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (!order || !orderId || !userId) return;

    Alert.alert(
      'Update Order Status',
      `Change order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setUpdating(true);
              await updateOrderStatus(orderId, userId, newStatus);
              // Refresh order data
              const updatedOrder = await getOrderByIdForAdmin(orderId, userId);
              if (updatedOrder) {
                setOrder(updatedOrder);
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update order status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleApproveCancellation = () => {
    if (!order || !orderId || !userId) return;

    Alert.alert(
      'Approve Cancellation',
      'This will cancel the order and restore stock quantities. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingCancellation(true);
              await approveOrderCancellation(orderId, userId, 'Cancellation approved by admin');
              // Refresh order data
              const updatedOrder = await getOrderByIdForAdmin(orderId, userId);
              if (updatedOrder) {
                setOrder(updatedOrder);
              }
              Alert.alert('Success', 'Order cancelled and stock restored.');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to approve cancellation');
            } finally {
              setProcessingCancellation(false);
            }
          },
        },
      ],
    );
  };

  const handleRejectCancellation = () => {
    if (!order || !orderId || !userId) return;

    Alert.prompt(
      'Reject Cancellation',
      'Enter reason for rejection (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              setProcessingCancellation(true);
              await rejectOrderCancellation(orderId, userId, reason || undefined);
              // Refresh order data
              const updatedOrder = await getOrderByIdForAdmin(orderId, userId);
              if (updatedOrder) {
                setOrder(updatedOrder);
              }
              Alert.alert('Success', 'Cancellation request rejected.');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reject cancellation');
            } finally {
              setProcessingCancellation(false);
            }
          },
        },
      ],
      'plain-text',
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

  const statusOptions: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];
  const currentStatus = (order.status as OrderStatus) || 'processing';

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
              <Text style={[styles.userId, { color: colors.textSecondary, marginTop: 4 }]}>
                User ID: {userId}
              </Text>
              {order.paymentMethod && (
                <Text style={[styles.paymentMethod, { color: colors.textSecondary, marginTop: 4 }]}>
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
              style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}
            >
              <Text style={styles.statusText}>
                {String(currentStatus).charAt(0).toUpperCase() + String(currentStatus).slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancellation Request Card (Admin Only) */}
        {order.cancellationRequested && order.status !== 'cancelled' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: '#FF9500' }]}>
            <View style={styles.cancellationHeader}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF9500" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cancellation Request</Text>
            </View>
            <Text style={[styles.cancellationText, { color: colors.textSecondary }]}>
              User has requested to cancel this order.
            </Text>
            {order.cancellationReason && (
              <Text style={[styles.cancellationReason, { color: colors.textSecondary }]}>
                Reason: {order.cancellationReason}
              </Text>
            )}
            {order.cancellationRequestedAt && (
              <Text style={[styles.cancellationDate, { color: colors.textSecondary }]}>
                Requested: {formatTimelineDate(order.cancellationRequestedAt)}
              </Text>
            )}
            <View style={styles.cancellationActions}>
              <TouchableOpacity
                style={[styles.approveButton, { backgroundColor: '#4CD964' }]}
                onPress={handleApproveCancellation}
                disabled={processingCancellation || updating}
              >
                {processingCancellation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.cancellationButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleRejectCancellation}
                disabled={processingCancellation || updating}
              >
                {processingCancellation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.cancellationButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Management Card (Admin Only) */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Status</Text>
          <View style={styles.statusButtons}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor:
                      currentStatus === status ? getStatusColor(status) : colors.background,
                    borderColor: getStatusColor(status),
                    opacity: updating ? 0.5 : 1,
                  },
                ]}
                onPress={() => handleStatusUpdate(status)}
                disabled={updating || currentStatus === status}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color: currentStatus === status ? '#FFF' : getStatusColor(status),
                    },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Items Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Items ({order.itemCount || 0})
          </Text>
          {order.items?.map((item: any, index: number) => (
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
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address?.name}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address?.street}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {order.address?.city}, {order.address?.state} {order.address?.zipCode}
            </Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{order.address?.country}</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${Number(order.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${Number(order.shipping || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              ${Number(order.total || 0).toFixed(2)}
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
  userId: {
    fontSize: 12,
  },
  paymentMethod: {
    fontSize: 12,
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
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 12,
    gap: 8,
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
  cancellationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  cancellationButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminOrderDetailScreen;

