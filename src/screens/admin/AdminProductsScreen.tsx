import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeAllProducts, type AdminProductRow } from '../../services/admin/adminService';

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProductRow[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAllProducts(
      (rows) => {
        setProducts(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [isAdmin]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Products</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isAdmin ? `${products.length} products` : 'Admin only'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          disabled={!isAdmin}
          onPress={() => {
            navigation.navigate('AdminProductEdit');
          }}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isAdmin ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Not authorized</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AdminProductEdit', { id: item.id })}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.title || 'Untitled'}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.category || 'uncategorized'} • ${item.price.toFixed(2)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
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
});


