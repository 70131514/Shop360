import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { subscribeMyTickets, type Ticket, type TicketStatus } from '../../services/ticketService';

export default function MyTicketsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeMyTickets(
      (ticketsList) => {
        setTickets(ticketsList);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user]);

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

  if (selectedTicket) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Ticket Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
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
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Submitted</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(selectedTicket.createdAt)}
              </Text>
            </View>
          </View>

          <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Your Message</Text>
            <Text style={[styles.messageText, { color: colors.text }]}>{selectedTicket.message}</Text>
          </View>

          {/* Timeline Section */}
          <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.timelineTitle, { color: colors.text }]}>Status Timeline</Text>
            <Text style={[styles.timelineSubtitle, { color: colors.textSecondary }]}>
              Track the progress of your ticket
            </Text>
            {selectedTicket.timeline && selectedTicket.timeline.length > 0 ? (
              <View style={styles.timelineContainer}>
                {selectedTicket.timeline.map((event, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: getStatusColor(event.status),
                          borderColor: getStatusColor(event.status),
                        },
                      ]}
                    >
                      {index === selectedTicket.timeline!.length - 1 && (
                        <View style={[styles.timelineDotInner, { backgroundColor: colors.background }]} />
                      )}
                    </View>
                    {index < selectedTicket.timeline.length - 1 && (
                      <View
                        style={[styles.timelineLine, { backgroundColor: colors.border }]}
                      />
                    )}
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={[styles.timelineStatus, { color: colors.text }]}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('-', ' ')}
                        </Text>
                        <View
                          style={[
                            styles.timelineStatusBadge,
                            {
                              backgroundColor: getStatusColor(event.status) + '20',
                              borderColor: getStatusColor(event.status),
                            },
                          ]}
                        >
                          <Text
                            style={[styles.timelineStatusBadgeText, { color: getStatusColor(event.status) }]}
                          >
                            {event.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                        {formatDate(event.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.timelineFallback}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: getStatusColor(selectedTicket.status),
                      borderColor: getStatusColor(selectedTicket.status),
                    },
                  ]}
                />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.timelineStatus, { color: colors.text }]}>
                      {selectedTicket.status.charAt(0).toUpperCase() +
                        selectedTicket.status.slice(1).replace('-', ' ')}
                    </Text>
                    <View
                      style={[
                        styles.timelineStatusBadge,
                        {
                          backgroundColor: getStatusColor(selectedTicket.status) + '20',
                          borderColor: getStatusColor(selectedTicket.status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timelineStatusBadgeText,
                          { color: getStatusColor(selectedTicket.status) },
                        ]}
                      >
                        {selectedTicket.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                    {formatDate(selectedTicket.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>My Support Tickets</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !user ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Please sign in</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 12 }]}>
            No tickets yet
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
            Submit a ticket from Help & Support
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTicket(item)}
              activeOpacity={0.7}
              style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.ticketHeader}>
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
                <Text style={[styles.ticketDate, { color: colors.textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Text style={[styles.ticketMessage, { color: colors.text }]} numberOfLines={2}>
                {item.message}
              </Text>
              {item.timeline && item.timeline.length > 1 && (
                <Text style={[styles.timelineHint, { color: colors.textSecondary }]}>
                  {item.timeline.length} status updates
                </Text>
              )}
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
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 100, gap: 12 },
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
  ticketDate: { fontSize: 11 },
  ticketMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  timelineHint: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  detailContent: { padding: 16, paddingBottom: 100, gap: 16 },
  detailCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: { fontSize: 13, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
  messageCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  messageLabel: { fontSize: 13, fontWeight: '600' },
  messageText: { fontSize: 14, lineHeight: 22 },
  timelineCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  timelineSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineFallback: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 20,
    width: 2,
    height: 20,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  timelineStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  timelineStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timelineDate: {
    fontSize: 12,
  },
  emptyHint: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

