import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import {
  subscribeAllUsers,
  type AdminUserRow,
} from '../../services/admin/adminService';
import { subscribeUnreadTicketCount } from '../../services/ticketService';

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = subscribeUnreadTicketCount(
      (count) => setUnreadCount(count),
      () => {},
    );
    return unsub;
  }, [isAdmin]);

  // Filter users based on search query (by email, name, or ID)
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.trim().toLowerCase();
    return users.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.uid?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Users</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isAdmin ? `${users.length} users` : 'Admin only'}
        </Text>
      </View>

      {isAdmin && (
        <>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminInquiries')}
            style={[styles.inquiriesButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <View style={styles.inquiriesButtonLeft}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.background} />
              <Text style={[styles.inquiriesButtonText, { color: colors.background }]}>
                User Inquiries
              </Text>
            </View>
            {unreadCount > 0 && (
              <View style={[styles.unreadCountBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.unreadCountText, { color: colors.primary }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.roleAssignmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.roleAssignmentTitle, { color: colors.text }]}>Role Management</Text>
            <Text style={[styles.roleAssignmentHint, { color: colors.textSecondary }]}>
              Open a user to change role with confirmation and verification checks.
            </Text>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search users by email, name, or ID..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {searchQuery.trim() && (
              <Text style={[styles.searchResultsText, { color: colors.textSecondary }]}>
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user found' : 'users found'}
              </Text>
            )}
          </View>
        </>
      )}

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
          data={filteredUsers}
          keyExtractor={(u) => u.uid}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No users found matching "{searchQuery}"
                </Text>
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                  Try searching by email, name, or user ID
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminUserDetail', { userId: item.uid })}
              activeOpacity={0.7}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
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
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
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
  inquiriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  inquiriesButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inquiriesButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  unreadCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  roleAssignmentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  roleAssignmentTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  roleAssignmentHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  searchResultsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    textAlign: 'center',
  },
});


