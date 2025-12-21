import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { subscribeMyAddresses, deleteAddress, setDefaultAddress, type Address } from '../../services/addressService';

const ShippingAddressesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { alert } = useAppAlert();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

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
    alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(id);
            } catch (error: any) {
              alert('Error', error.message || 'Failed to delete address.');
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
    } catch (error: any) {
      alert('Error', error.message || 'Failed to set default address.');
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
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Shipping Addresses</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddAddress}
          >
            <Ionicons name="add" size={20} color={colors.background} />
            <Text style={[styles.addButtonText, { color: colors.background }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No addresses saved</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Add an address to get started
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary, marginTop: 20 }]}
              onPress={handleAddAddress}
            >
              <Ionicons name="add" size={20} color={colors.background} />
              <Text style={[styles.addButtonText, { color: colors.background }]}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
          <View key={address.id} style={[styles.addressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.addressHeader}>
              <View style={styles.addressTitleContainer}>
                <Text style={[styles.addressName, { color: colors.text }]}>{address.name}</Text>
                {address.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.defaultBadgeText, { color: colors.background }]}>
                      Default
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditAddress(address)}
                >
                  <Ionicons name="pencil" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteAddress(address.id)}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.addressText, { color: colors.text }]}>{address.street}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {address.city}, {address.state} {address.zipCode}
            </Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{address.country}</Text>

            {!address.isDefault && (
              <TouchableOpacity
                style={[styles.setDefaultButton, { borderColor: colors.border }]}
                onPress={() => handleSetDefault(address.id)}
              >
                <Text style={[styles.setDefaultText, { color: colors.text }]}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  addressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShippingAddressesScreen;
