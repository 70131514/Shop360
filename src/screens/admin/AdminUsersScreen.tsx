import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeAllUsers, type AdminUserRow } from '../../services/admin/adminService';

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserRow[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAllUsers(
      (rows) => {
        setUsers(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [isAdmin]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Users</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isAdmin ? `${users.length} users` : 'Admin only'}
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
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.uid}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.name || '—'}
                </Text>
                <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.email || '—'}
                </Text>
              </View>
              <View style={[styles.badge, { borderColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {item.role || 'user'}
                </Text>
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
  name: { fontSize: 15, fontWeight: '700' },
  email: { fontSize: 12, marginTop: 2 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
});


