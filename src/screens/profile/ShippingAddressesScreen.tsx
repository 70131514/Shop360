import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import {
  subscribeMyAddresses,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from '../../services/addressService';

const ShippingAddressesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { alert } = useAppAlert();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeMyAddresses(
      (addressList) => {
        setAddresses(addressList);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading addresses:', error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleEditAddress = (address: Address) => {
    navigation.navigate('AddressForm', { address });
  };

  const handleDeleteAddress = (id: string) => {
    alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(id);
            await deleteAddress(id);
            alert('Success', 'Address deleted successfully');
          } catch (error: any) {
            alert('Error', error.message || 'Failed to delete address.');
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
      await setDefaultAddress(id);
      alert('Success', 'Default address updated');
    } catch (error: any) {
      alert('Error', error.message || 'Failed to set default address.');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleAddAddress = () => {
    if (!user) {
      alert('Sign in required', 'Please sign in to add addresses.');
      return;
    }
    navigation.navigate('AddressForm');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shipping Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading addresses...
          </Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No addresses saved</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add an address to get started
          </Text>
          <TouchableOpacity
            style={[styles.addAddressButton, { backgroundColor: colors.primary }]}
            onPress={handleAddAddress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.background} />
            <Text style={[styles.addAddressButtonText, { color: colors.background }]}>
              Add Address
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {addresses.map((address) => (
            <View
              key={address.id}
              style={[
                styles.addressCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                  <View
                    style={[
                      styles.addressIconContainer,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Ionicons name="location" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.addressTextInfo}>
                    <View style={styles.addressTitleRow}>
                      <Text style={[styles.addressName, { color: colors.text }]}>
                        {address.name}
                      </Text>
                      {address.isDefault && (
                        <View
                          style={[styles.defaultBadge, { backgroundColor: colors.primary + '15' }]}
                        >
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteAddress(address.id)}
                    disabled={deletingId === address.id}
                    activeOpacity={0.7}
                  >
                    {deletingId === address.id ? (
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.addressDetails}>
                <View style={styles.addressDetailItem}>
                  <Text style={[styles.addressDetailLabel, { color: colors.textSecondary }]}>
                    Street
                  </Text>
                  <Text style={[styles.addressDetailValue, { color: colors.text }]}>
                    {address.street}
                  </Text>
                </View>
                <View style={styles.addressDetailItem}>
                  <Text style={[styles.addressDetailLabel, { color: colors.textSecondary }]}>
                    City, State
                  </Text>
                  <Text style={[styles.addressDetailValue, { color: colors.text }]}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>
                </View>
                <View style={styles.addressDetailItem}>
                  <Text style={[styles.addressDetailLabel, { color: colors.textSecondary }]}>
                    Country
                  </Text>
                  <Text style={[styles.addressDetailValue, { color: colors.text }]}>
                    {address.country}
                  </Text>
                </View>
              </View>

              {!address.isDefault && (
                <TouchableOpacity
                  style={[styles.setDefaultButton, { borderColor: colors.border }]}
                  onPress={() => handleSetDefault(address.id)}
                  disabled={settingDefaultId === address.id}
                  activeOpacity={0.7}
                >
                  {settingDefaultId === address.id ? (
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  } as ViewStyle,
  addAddressButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  } as ViewStyle,
  addressCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  } as ViewStyle,
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  addressTextInfo: {
    flex: 1,
  } as ViewStyle,
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  } as ViewStyle,
  addressName: {
    fontSize: 16,
    fontWeight: '600',
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
  addressActions: {
    flexDirection: 'row',
    gap: 4,
  } as ViewStyle,
  actionButton: {
    padding: 6,
    marginTop: -6,
  } as ViewStyle,
  addressDetails: {
    gap: 12,
    marginTop: 4,
  } as ViewStyle,
  addressDetailItem: {
    gap: 4,
  } as ViewStyle,
  addressDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  } as TextStyle,
  addressDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
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

export default ShippingAddressesScreen;
