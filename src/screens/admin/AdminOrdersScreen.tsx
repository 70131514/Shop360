import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeAllOrders, type AdminOrderRow } from '../../services/admin/adminService';

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAllOrders(
      (rows) => {
        setOrders(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [isAdmin]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isAdmin ? `${orders.length} orders` : 'Admin only'}
        </Text>
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
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  Order #{item.shortId}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                  User: {item.userId}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: colors.text }]}>${item.total.toFixed(2)}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  row: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '800' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});


