import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  subscribePaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  type SavedCard,
} from '../../services/paymentMethodService';
import { useAppAlert } from '../../contexts/AppAlertContext';

const PaymentMethodsScreen = () => {
  const { colors } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const [paymentMethods, setPaymentMethods] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePaymentMethods(
      (methods) => {
        setPaymentMethods(methods);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading payment methods:', err);
        setLoading(false);
        alert('Error', 'Failed to load payment methods');
      },
    );

    return unsubscribe;
  }, [alert]);

  const handleDeletePaymentMethod = async (id: string) => {
    alert('Delete Card', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(id);
            await deletePaymentMethod(id);
            alert('Success', 'Payment method deleted successfully');
          } catch (err) {
            alert('Error', err instanceof Error ? err.message : 'Failed to delete payment method');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      await setDefaultPaymentMethod(id);
      alert('Success', 'Default payment method updated');
    } catch (err) {
      alert('Error', err instanceof Error ? err.message : 'Failed to set default payment method');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const getCardIcon = (cardType: string): string => {
    switch (cardType) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      case 'discover':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (cardType: string) => {
    switch (cardType) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      case 'discover':
        return '#FF6000';
      default:
        return colors.primary;
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPaymentCard')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading payment methods...
          </Text>
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No payment methods</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add a payment card to get started
          </Text>
          <TouchableOpacity
            style={[styles.addCardButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddPaymentCard')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.background} />
            <Text style={[styles.addCardButtonText, { color: colors.background }]}>Add Card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              style={[
                styles.cardContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: getCardColor(method.cardType) + '15' },
                    ]}
                  >
                    <Ionicons
                      name={getCardIcon(method.cardType)}
                      size={20}
                      color={getCardColor(method.cardType)}
                    />
                  </View>
                  <View style={styles.cardTextInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardType, { color: colors.text }]}>
                        {method.cardType.charAt(0).toUpperCase() + method.cardType.slice(1)}
                      </Text>
                      {method.isDefault && (
                        <View
                          style={[styles.defaultBadge, { backgroundColor: colors.primary + '15' }]}
                        >
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardNumber, { color: colors.textSecondary }]}>
                      •••• {method.last4}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePaymentMethod(method.id)}
                  disabled={deletingId === method.id}
                  activeOpacity={0.7}
                >
                  {deletingId === method.id ? (
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardDetailItem}>
                  <Text style={[styles.cardDetailLabel, { color: colors.textSecondary }]}>
                    Expires
                  </Text>
                  <Text style={[styles.cardDetailValue, { color: colors.text }]}>
                    {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </View>
                {method.cardholderName && (
                  <View style={styles.cardDetailItem}>
                    <Text style={[styles.cardDetailLabel, { color: colors.textSecondary }]}>
                      Name
                    </Text>
                    <Text style={[styles.cardDetailValue, { color: colors.text }]}>
                      {method.cardholderName}
                    </Text>
                  </View>
                )}
              </View>

              {!method.isDefault && (
                <TouchableOpacity
                  style={[styles.setDefaultButton, { borderColor: colors.border }]}
                  onPress={() => handleSetDefault(method.id)}
                  disabled={settingDefaultId === method.id}
                  activeOpacity={0.7}
                >
                  {settingDefaultId === method.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="star-outline" size={16} color={colors.primary} />
                      <Text style={[styles.setDefaultText, { color: colors.primary }]}>
                        Set as Default
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  } as ViewStyle,
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  } as ViewStyle,
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
  addButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  } as ViewStyle,
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  } as TextStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  } as ViewStyle,
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  } as ViewStyle,
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  } as ViewStyle,
  cardContainer: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  cardTextInfo: {
    flex: 1,
  } as ViewStyle,
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  } as ViewStyle,
  cardType: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  cardNumber: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  } as ViewStyle,
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  } as TextStyle,
  cardDetails: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  } as ViewStyle,
  cardDetailItem: {
    gap: 4,
  } as ViewStyle,
  cardDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  } as TextStyle,
  cardDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  deleteButton: {
    padding: 6,
    marginTop: -6,
  } as ViewStyle,
  setDefaultButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  } as ViewStyle,
  setDefaultText: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});

export default PaymentMethodsScreen;
