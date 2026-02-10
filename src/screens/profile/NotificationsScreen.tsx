import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from '../../services/notificationService';

type NotificationPreference = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const NotificationsScreen = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      title: 'Order Updates',
      description: 'Get notified about your order status and delivery updates',
      enabled: true,
    },
    {
      id: '2',
      title: 'Promotions & Deals',
      description: 'Receive notifications about special offers and discounts',
      enabled: true,
    },
    {
      id: '3',
      title: 'New Arrivals',
      description: 'Be the first to know about new products in your favorite categories',
      enabled: false,
    },
    {
      id: '4',
      title: 'Price Drops',
      description: 'Get alerts when items in your wishlist go on sale',
      enabled: true,
    },
    {
      id: '5',
      title: 'Back in Stock',
      description: 'Receive notifications when out-of-stock items become available',
      enabled: false,
    },
    {
      id: '6',
      title: 'Account Security',
      description: 'Get notified about important security updates and login attempts',
      enabled: true,
    },
  ]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeNotifications(
      (notifs) => {
        setNotifications(notifs);
        setLoading(false);
      },
      (error: any) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        // Error is already handled by notificationService with appropriate message
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleTogglePreference = (id: string) => {
    setPreferences(
      preferences.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)),
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
      // Remove notifications once they are seen/opened.
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('Failed to handle notification open:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.filter((n) => !n.read).length === 0) {
      return;
    }

    setMarkingAsRead(true);
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotification(notificationId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notification');
            console.error('Failed to delete notification:', error);
          }
        },
      },
    ]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'product_removed':
        return 'trash-outline';
      case 'order_update':
        return 'bag-outline';
      case 'promotion':
        return 'pricetag-outline';
      default:
        return 'notifications-outline';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'notifications' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'notifications' ? colors.primary : colors.textSecondary },
            ]}
          >
            Notifications
          </Text>
          <View
            style={[
              styles.tabBadge,
              {
                backgroundColor: isDark ? colors.surface : colors.primary,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                { color: isDark ? colors.text : colors.background },
              ]}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'preferences' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'preferences' ? colors.primary : colors.textSecondary },
            ]}
          >
            Preferences
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'notifications' ? (
          <>
            {!user ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  Sign in to view notifications
                </Text>
              </View>
            ) : loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : notifications.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Ionicons name="notifications-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  No notifications yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  You'll see updates about your orders and products here
                </Text>
              </View>
            ) : (
              <>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={[styles.markAllButton, { borderColor: colors.border }]}
                    onPress={handleMarkAllAsRead}
                    disabled={markingAsRead}
                  >
                    {markingAsRead ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
                        <Text style={[styles.markAllText, { color: colors.primary }]}>
                          Mark all as read
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <View style={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        {
                          backgroundColor: colors.surface,
                          borderColor: notification.read ? colors.border : colors.primary,
                          borderLeftWidth: notification.read ? 1 : 4,
                        },
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notificationContent}>
                        <View
                          style={[
                            styles.notificationIconContainer,
                            { backgroundColor: colors.primary + '15' },
                          ]}
                        >
                          <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.notificationTextContainer}>
                          <View style={styles.notificationHeader}>
                            <Text style={[styles.notificationTitle, { color: colors.text }]}>
                              {notification.title}
                            </Text>
                            {!notification.read && (
                              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                            )}
                          </View>
                          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                            {notification.message}
                          </Text>
                          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                            {formatDate(notification.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteNotification(notification.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Push Notifications</Text>
              </View>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Choose what you want to be notified about
              </Text>
            </View>

            <View style={styles.preferencesContainer}>
              {preferences.map((preference) => (
                <View
                  key={preference.id}
                  style={[styles.preferenceItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.preferenceInfo}>
                    <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                      {preference.title}
                    </Text>
                    <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                      {preference.description}
                    </Text>
                  </View>
                  <Switch
                    value={preference.enabled}
                    onValueChange={() => handleTogglePreference(preference.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFF"
                  />
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mail-outline" size={24} color={colors.text} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Notifications</Text>
              </View>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Manage your email notification preferences
              </Text>
              <TouchableOpacity
                style={[styles.emailButton, { borderColor: colors.border }]}
                onPress={() => {}}
              >
                <Text style={[styles.emailButtonText, { color: colors.text }]}>
                  Manage Email Preferences
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  section: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginLeft: 36,
  },
  preferencesContainer: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  emailButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
