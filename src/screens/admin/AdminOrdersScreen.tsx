import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeAllOrders, type AdminOrderRow } from '../../services/admin/adminService';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

type OrderSection = {
  status: OrderStatus;
  title: string;
  orders: AdminOrderRow[];
  collapsed: boolean;
};

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<OrderStatus, boolean>>({
    processing: false,
    shipped: false,
    delivered: false,
    cancelled: false,
  });

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    
    // Subscribe to real-time order updates from Firestore
    // This will automatically sync all order status changes in real-time
    const unsub = subscribeAllOrders(
      (rows) => {
        // Always apply the latest data from Firestore
        // This ensures status changes are reflected immediately across all orders
        setOrders(rows);
        setLoading(false);
      },
      (err) => {
        console.error('Error in orders subscription:', err);
        setLoading(false);
      },
    );
    
    return unsub;
  }, [isAdmin]);

  const orderSections = useMemo(() => {
    const statusOrder: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];
    const statusLabels: Record<OrderStatus, string> = {
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    // Filter orders by status, ensuring status is normalized for comparison
    return statusOrder.map((status) => ({
      status,
      title: statusLabels[status],
      orders: orders.filter((o) => {
        const orderStatus = String(o.status || 'processing').toLowerCase();
        return orderStatus === status;
      }),
      collapsed: collapsedSections[status],
    }));
  }, [orders, collapsedSections]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return '#FF9500';
      case 'shipped':
        return '#007AFF';
      case 'delivered':
        return '#4CD964';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.textSecondary;
    }
  };

  const toggleSection = (status: OrderStatus) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toMillis) {
        return new Date(timestamp.toMillis()).toLocaleDateString();
      }
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const renderOrderItem = (item: AdminOrderRow) => {
    const isUnread = !item.viewedByAdmin;
    // Ensure status is properly normalized
    const normalizedStatus = String(item.status || 'processing').toLowerCase() as OrderStatus;
    const statusColor = getStatusColor(normalizedStatus);
    return (
      <TouchableOpacity
        key={`${item.id}-${normalizedStatus}`}
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.surface,
            borderColor: isUnread ? colors.primary : colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id, userId: item.userId })}
      >
        <View style={styles.orderCardContent}>
          <View style={styles.orderCardLeft}>
            <View style={styles.orderCardHeader}>
              <Text style={[styles.orderId, { color: colors.text }]}>
                #{item.shortId}
              </Text>
              {isUnread && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <View style={styles.orderCardStatusRow}>
              <View style={[styles.orderStatusBadge, { backgroundColor: statusColor + '15' }]}>
                <View style={[styles.orderStatusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.orderStatusText, { color: statusColor }]}>
                  {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={[styles.orderUser, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.userId.slice(0, 20)}...
            </Text>
          </View>
          <View style={styles.orderCardRight}>
            <Text style={[styles.orderAmount, { color: colors.text }]}>
              ${item.total.toFixed(2)}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: OrderSection) => {
    const statusColor = getStatusColor(section.status);
    const isEmpty = section.orders.length === 0;

    return (
      <View key={section.status} style={styles.section}>
        <TouchableOpacity
          style={[
            styles.sectionHeader,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: isEmpty ? 0.5 : 1,
            },
          ]}
          onPress={() => toggleSection(section.status)}
          disabled={isEmpty}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            {!isEmpty && (
              <View style={[styles.countPill, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.countText, { color: statusColor }]}>
                  {section.orders.length}
                </Text>
              </View>
            )}
          </View>
          {!isEmpty && (
            <Ionicons
              name={section.collapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={colors.textSecondary}
            />
          )}
        </TouchableOpacity>

        {!section.collapsed && !isEmpty && (
          <View style={styles.sectionContent}>
            {section.orders.map((order) => (
              <View key={`${order.id}-${order.status}`}>
                {renderOrderItem(order)}
              </View>
            ))}
          </View>
        )}

        {isEmpty && (
          <View style={[styles.emptySection, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
              No {section.title.toLowerCase()} orders
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
          {isAdmin && orders.length > 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isAdmin ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Not authorized</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders found</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Orders will appear here when customers make purchases
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {orderSections.map((section) => renderSection(section))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContent: {
    gap: 8,
  },
  emptySection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  orderCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderUser: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  orderCardStatusRow: {
    marginTop: 6,
    marginBottom: 4,
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  orderStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderCardRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
  },
});


