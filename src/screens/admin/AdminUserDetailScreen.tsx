import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  getUserByUid,
  updateUserRole,
  getUserAddresses,
  getUserTickets,
  type AdminUserRow,
} from '../../services/admin/adminService';
import { useAppAlert } from '../../contexts/AppAlertContext';
import type { Address } from '../../services/addressService';
import type { Ticket } from '../../services/ticketService';

export default function AdminUserDetailScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<(AdminUserRow & { createdAt?: any }) | null>(null);
  const [roleInput, setRoleInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    if (!isAdmin || !userId) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const userData = await getUserByUid(userId);
        setUser(userData);
        if (userData) {
          setRoleInput(userData.role || 'user');
        }

        // Load addresses
        try {
          const userAddresses = await getUserAddresses(userId);
          setAddresses(userAddresses);
        } catch (error) {
          console.error('Failed to load addresses:', error);
        } finally {
          setLoadingAddresses(false);
        }

        // Load tickets
        try {
          const userTickets = await getUserTickets(userId);
          setTickets(userTickets);
        } catch (error) {
          console.error('Failed to load tickets:', error);
        } finally {
          setLoadingTickets(false);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        alert('Error', 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, isAdmin]);

  const handleUpdateRole = async () => {
    if (!user || !roleInput.trim()) {
      alert('Error', 'Please enter a valid role.');
      return;
    }

    setUpdating(true);
    try {
      await updateUserRole(user.uid, roleInput.trim());
      // Reload user data
      const updatedUser = await getUserByUid(user.uid);
      setUser(updatedUser);
      alert('Success', 'User role updated successfully.');
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert('Error', error?.message || 'Failed to update user role.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#FF9500';
      case 'in-progress':
        return '#007AFF';
      case 'resolved':
        return '#4CD964';
      case 'closed':
        return '#8E8E93';
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>User Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>User Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>User Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user.name || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user.email || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>User ID</Text>
            <Text style={[styles.value, { color: colors.text, fontSize: 12 }]} numberOfLines={1}>
              {user.uid}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Current Role</Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    user.role === 'admin' ? colors.primary + '20' : colors.textSecondary + '20',
                  borderColor: user.role === 'admin' ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color: user.role === 'admin' ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {(user.role || 'user').toUpperCase()}
              </Text>
            </View>
          </View>
          {user.createdAt && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Account Created</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatDate(user.createdAt)}</Text>
            </View>
          )}
        </View>

        {/* Addresses Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Addresses</Text>
          {loadingAddresses ? (
            <ActivityIndicator color={colors.primary} style={styles.loadingIndicator} />
          ) : addresses.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No addresses found</Text>
          ) : (
            addresses.map((address) => (
              <View
                key={address.id}
                style={[styles.addressItem, { borderColor: colors.border }]}
              >
                <View style={styles.addressHeader}>
                  <Text style={[styles.addressName, { color: colors.text }]}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {address.street}
                </Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {address.city}, {address.state} {address.zipCode}
                </Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {address.country}
                </Text>
                {address.createdAt && (
                  <Text style={[styles.addressDate, { color: colors.textSecondary }]}>
                    Added: {formatDate(address.createdAt)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Tickets/Inquiries Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support Tickets</Text>
          {loadingTickets ? (
            <ActivityIndicator color={colors.primary} style={styles.loadingIndicator} />
          ) : tickets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tickets found</Text>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                onPress={() => navigation.navigate('AdminInquiries', { ticketId: ticket.id })}
                activeOpacity={0.7}
                style={[styles.ticketItem, { borderColor: colors.border }]}
              >
                <View style={styles.ticketHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(ticket.status) + '20',
                        borderColor: getStatusColor(ticket.status),
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                      {ticket.status.toUpperCase()}
                    </Text>
                  </View>
                  {ticket.createdAt && (
                    <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>
                      {formatDate(ticket.createdAt)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.ticketMessage, { color: colors.text }]} numberOfLines={3}>
                  {ticket.message}
                </Text>
                {ticket.timeline && ticket.timeline.length > 1 && (
                  <Text style={[styles.timelineHint, { color: colors.textSecondary }]}>
                    {ticket.timeline.length} status changes
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Role</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Change the user's role (e.g., 'user', 'admin', 'moderator')
          </Text>

          <View style={styles.roleInputContainer}>
            <TextInput
              style={[
                styles.roleInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter role"
              placeholderTextColor={colors.textSecondary}
              value={roleInput}
              onChangeText={setRoleInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={handleUpdateRole}
              disabled={updating || roleInput.trim() === (user.role || 'user')}
              style={[
                styles.updateButton,
                {
                  backgroundColor:
                    updating || roleInput.trim() === (user.role || 'user')
                      ? colors.border
                      : colors.primary,
                },
              ]}
            >
              {updating ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={[styles.updateButtonText, { color: colors.background }]}>
                  Update
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 100, gap: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sectionHint: { fontSize: 12, marginBottom: 12 },
  roleInputContainer: {
    gap: 12,
  },
  roleInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  updateButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  addressItem: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
    gap: 6,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
  },
  addressDate: {
    fontSize: 11,
    marginTop: 4,
  },
  ticketItem: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
    gap: 8,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ticketDate: {
    fontSize: 11,
  },
  ticketMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  timelineHint: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

