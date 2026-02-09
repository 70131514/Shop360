import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  const { isAdmin, user: authUser } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<
    (AdminUserRow & { createdAt?: any; isEmailVerified?: boolean }) | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [updating, setUpdating] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const isEditingOwnAccount =
    !!user &&
    !!authUser &&
    (authUser.uid === user.uid ||
      (authUser.email ?? '').trim().toLowerCase() === (user.email ?? '').trim().toLowerCase());
  const hasValidEmail = !!user?.email?.trim();
  const isVerifiedUser = user?.isEmailVerified === true;
  const canShowRoleToggle = !!user && hasValidEmail && isVerifiedUser && !isEditingOwnAccount;

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
          setSelectedRole(userData.role === 'admin' ? 'admin' : 'user');
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

  const updateRoleConfirmed = async () => {
    if (!user) {
      return;
    }
    setUpdating(true);
    try {
      await updateUserRole(user.uid, selectedRole);
      const updatedUser = await getUserByUid(user.uid);
      setUser(updatedUser);
      if (updatedUser) {
        setSelectedRole(updatedUser.role === 'admin' ? 'admin' : 'user');
      }
      alert('Success', `Role updated to ${selectedRole.toUpperCase()}.`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert('Error', error?.message || 'Failed to update user role.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateRole = () => {
    if (!user) {
      alert('Error', 'User not found.');
      return;
    }

    if (!user.email?.trim()) {
      alert('Email missing', 'This user has no valid email address, so role cannot be changed.');
      return;
    }

    if (!user.isEmailVerified) {
      alert(
        'Email not verified',
        'This user must verify their email before their role can be changed.',
      );
      return;
    }

    const currentRole = user.role === 'admin' ? 'admin' : 'user';
    if (selectedRole === currentRole) {
      return;
    }
    if (selectedRole === 'user' && isEditingOwnAccount) {
      alert(
        'Action not allowed',
        'You cannot change your own role from ADMIN to USER. Ask another admin to do this if needed.',
      );
      return;
    }

    alert(
      'Confirm role change',
      `Change role for ${user.email} from ${currentRole.toUpperCase()} to ${selectedRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            void updateRoleConfirmed();
          },
        },
      ],
    );
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
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Verified</Text>
            <Text
              style={[
                styles.value,
                { color: user.isEmailVerified ? colors.primary : colors.textSecondary },
              ]}
            >
              {user.isEmailVerified ? 'Yes' : 'No'}
            </Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Role Access</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Choose one role and confirm. Roles are synced to Firebase immediately.
          </Text>

          {canShowRoleToggle ? (
            <View style={styles.roleInputContainer}>
              <View
                style={[
                  styles.toggleContainer,
                  {
                    borderColor: colors.border,
                  },
                ]}
              >
                {(['user', 'admin'] as const).map((role) => {
                  const isSelected = selectedRole === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      activeOpacity={0.85}
                      disabled={updating}
                      onPress={() => setSelectedRole(role)}
                      style={[
                        styles.toggleOption,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleOptionText,
                          { color: isSelected ? colors.background : colors.text },
                        ]}
                      >
                        {role.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={handleUpdateRole}
                disabled={
                  updating || selectedRole === (user.role === 'admin' ? 'admin' : 'user')
                }
                style={[
                  styles.updateButton,
                  {
                    backgroundColor:
                      updating || selectedRole === (user.role === 'admin' ? 'admin' : 'user')
                        ? colors.border
                        : colors.primary,
                  },
                ]}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={[styles.updateButtonText, { color: colors.background }]}>
                    Save Role
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.roleGuardNote,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.roleGuardTitle, { color: colors.text }]}>Role change unavailable</Text>
              <Text style={[styles.roleGuardText, { color: colors.textSecondary }]}>
                {!hasValidEmail
                  ? 'Guest account detected. Guests must register and verify their email before they can be assigned as ADMIN.'
                  : !isVerifiedUser
                  ? 'This account is not email-verified. Only verified users can be assigned as ADMIN.'
                  : 'You cannot change your own ADMIN status.'}
              </Text>
            </View>
          )}
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
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  toggleOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  roleGuardNote: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  roleGuardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  roleGuardText: {
    fontSize: 12,
    lineHeight: 18,
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

