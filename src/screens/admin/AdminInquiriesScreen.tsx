import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  subscribeAllTickets,
  markTicketAsViewed,
  updateTicketStatus,
  type Ticket,
  type TicketStatus,
} from '../../services/ticketService';
import { useAppAlert } from '../../contexts/AppAlertContext';

export default function AdminInquiriesScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const route = useRoute<any>();
  const initialTicketId = route.params?.ticketId;

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Mark as viewed if not already viewed
    if (!ticket.viewedByAdmin) {
      try {
        await markTicketAsViewed(ticket.id);
      } catch (error) {
        console.error('Failed to mark ticket as viewed:', error);
      }
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const unsub = subscribeAllTickets(
      (ticketsList) => {
        setTickets(ticketsList);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [isAdmin]);

  // Update selected ticket when tickets list changes (for status and timeline updates)
  useEffect(() => {
    if (selectedTicket && tickets.length > 0) {
      const updatedTicket = tickets.find((t) => t.id === selectedTicket.id);
      if (updatedTicket) {
        // Check if status or timeline changed
        const statusChanged = updatedTicket.status !== selectedTicket.status;
        const timelineChanged =
          JSON.stringify(updatedTicket.timeline || []) !==
          JSON.stringify(selectedTicket.timeline || []);
        if (statusChanged || timelineChanged) {
          setSelectedTicket(updatedTicket);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  // Handle initial ticket ID after tickets are loaded
  useEffect(() => {
    if (initialTicketId && tickets.length > 0 && !selectedTicket) {
      const ticket = tickets.find((t) => t.id === initialTicketId);
      if (ticket) {
        handleViewTicket(ticket);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTicketId, tickets]);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      // Update locally for immediate feedback while waiting for subscription
      if (selectedTicket && selectedTicket.id === ticketId) {
        const existingTimeline = selectedTicket.timeline || [];
        const newTimeline = [
          ...existingTimeline,
          {
            status: newStatus,
            timestamp: new Date(),
          },
        ];
        const updatedTicket = {
          ...selectedTicket,
          status: newStatus,
          timeline: newTimeline,
        };
        setSelectedTicket(updatedTicket);
      }
      // The subscription will update the tickets list, which will then sync the selectedTicket
      // with the server data (including proper timestamps)
      alert('Success', 'Ticket status updated successfully.');
    } catch (error: any) {
      console.error('Failed to update ticket status:', error);
      alert('Error', error?.message || 'Failed to update ticket status.');
    }
  };

  const getStatusColor = (status: TicketStatus) => {
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      return '—';
    }
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isUnread = (ticket: Ticket) => {
    return !ticket.viewedByAdmin || ticket.status === 'open';
  };

  const normalizedSearch = searchEmail.trim().toLowerCase();
  const filteredTickets =
    normalizedSearch.length === 0
      ? tickets
      : tickets.filter((t) => (t.userEmail || '').toLowerCase().includes(normalizedSearch));

  const prettyStatus = (status: TicketStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  const getTimelineForTicket = (
    ticket: Ticket,
  ): Array<{ status: TicketStatus; timestamp: any }> => {
    const list =
      ticket.timeline && ticket.timeline.length > 0
        ? ticket.timeline
        : [
            {
              status: ticket.status,
              timestamp: ticket.createdAt,
            },
          ];

    return [...list].sort((a, b) => {
      const aTime = a?.timestamp?.toDate
        ? a.timestamp.toDate().getTime()
        : new Date(a?.timestamp ?? 0).getTime();
      const bTime = b?.timestamp?.toDate
        ? b.timestamp.toDate().getTime()
        : new Date(b?.timestamp ?? 0).getTime();
      return aTime - bTime;
    });
  };

  if (selectedTicket) {
    const timeline = getTimelineForTicket(selectedTicket);
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (initialTicketId) {
                // If we came from another screen, go back
                navigation.goBack();
              } else {
                // Otherwise just clear selection
                setSelectedTicket(null);
              }
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Ticket Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.detailHeroCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.detailHeroTop}>
              <View style={styles.detailIdentity}>
                <Text style={[styles.detailName, { color: colors.text }]} numberOfLines={1}>
                  {selectedTicket.userName || 'User'}
                </Text>
                <Text
                  style={[styles.detailEmail, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedTicket.userEmail}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(selectedTicket.status) + '20',
                    borderColor: getStatusColor(selectedTicket.status),
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(selectedTicket.status) }]}>
                  {selectedTicket.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.detailHeroMeta}>
              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>
                  {formatDate(selectedTicket.createdAt)}
                </Text>
              </View>
              {isUnread(selectedTicket) && (
                <View
                  style={[
                    styles.metaPill,
                    { backgroundColor: colors.primary + '18', borderColor: colors.primary },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.metaPillText, { color: colors.primary }]}>Unread</Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.messageCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Message</Text>
            <Text style={[styles.messageText, { color: colors.text }]}>
              {selectedTicket.message}
            </Text>
          </View>

          {/* Timeline Section */}
          <View
            style={[
              styles.timelineCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.timelineTitleRow}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Progress</Text>
              <Text style={[styles.timelineCount, { color: colors.textSecondary }]}>
                {timeline.length} {timeline.length === 1 ? 'update' : 'updates'}
              </Text>
            </View>

            <View style={styles.timelineList}>
              {timeline.map((event, index) => {
                const isCurrent = index === timeline.length - 1;
                return (
                  <View key={`${event.status}-${index}`} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineDotSmall,
                        { backgroundColor: getStatusColor(event.status) },
                      ]}
                    />
                    <View style={styles.timelineRowBody}>
                      <Text style={[styles.timelineRowStatus, { color: colors.text }]}>
                        {prettyStatus(event.status)}
                      </Text>
                      <Text style={[styles.timelineRowDate, { color: colors.textSecondary }]}>
                        {formatDate(event.timestamp)}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View
                        style={[
                          styles.currentBadge,
                          { backgroundColor: colors.primary + '18', borderColor: colors.primary },
                        ]}
                      >
                        <Text style={[styles.currentBadgeText, { color: colors.primary }]}>
                          CURRENT
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.actionsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.actionsTitle, { color: colors.text }]}>Update Status</Text>
            <View style={styles.statusButtons}>
              {(['open', 'in-progress', 'resolved', 'closed'] as TicketStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => handleStatusChange(selectedTicket.id, status)}
                  disabled={selectedTicket.status === status}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        selectedTicket.status === status
                          ? getStatusColor(status)
                          : colors.background,
                      borderColor: getStatusColor(status),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      {
                        color: selectedTicket.status === status ? '#FFF' : getStatusColor(status),
                      },
                    ]}
                  >
                    {prettyStatus(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>User Inquiries</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !isAdmin ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Not authorized</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 12 }]}>
            No inquiries yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.searchWrap}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={searchEmail}
                  onChangeText={setSearchEmail}
                  placeholder="Search tickets by user email…"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {searchEmail.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchEmail('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              {normalizedSearch.length > 0 && (
                <Text style={[styles.searchHint, { color: colors.textSecondary }]}>
                  Showing {filteredTickets.length} result{filteredTickets.length === 1 ? '' : 's'}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
              <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 10 }]}>
                No tickets match that email
              </Text>
            </View>
          }
          renderItem={({ item }) => ( // Ticket Card
            <TouchableOpacity
              onPress={() => handleViewTicket(item)}
              style={[
                styles.ticketCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderLeftWidth: isUnread(item) ? 4 : 1,
                  borderLeftColor: isUnread(item) ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketHeaderLeft}>
                  <Text style={[styles.ticketUserName, { color: colors.text }]} numberOfLines={1}>
                    {item.userName}
                  </Text>
                  {isUnread(item) && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(item.status) + '20',
                      borderColor: getStatusColor(item.status),
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.ticketEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.userEmail}
              </Text>
              <Text style={[styles.ticketMessage, { color: colors.text }]} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>
                {formatDate(item.createdAt)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  headerSpacer: { width: 24 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerEmpty: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  searchWrap: { marginBottom: 12, gap: 8 },
  searchBar: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  searchHint: { fontSize: 12 },
  ticketCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ticketUserName: { fontSize: 15, fontWeight: '700', flex: 1 },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
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
  ticketEmail: { fontSize: 12 },
  ticketMessage: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  ticketDate: { fontSize: 11, marginTop: 4 },
  detailContent: { padding: 16, paddingBottom: 100, gap: 16 },
  detailHeroCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  detailHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailIdentity: { flex: 1, paddingRight: 12, gap: 4 },
  detailName: { fontSize: 16, fontWeight: '800' },
  detailEmail: { fontSize: 12 },
  detailHeroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaPillText: { fontSize: 11, fontWeight: '700' },
  messageCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  messageLabel: { fontSize: 13, fontWeight: '600' },
  messageText: { fontSize: 14, lineHeight: 22 },
  actionsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  actionsTitle: { fontSize: 15, fontWeight: '800' },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  timelineCount: {
    fontSize: 12,
  },
  timelineList: { marginTop: 4, gap: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timelineDotSmall: { width: 10, height: 10, borderRadius: 999 },
  timelineRowBody: { flex: 1, gap: 2 },
  timelineRowStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineRowDate: { fontSize: 12 },
  currentBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '900' },
});
