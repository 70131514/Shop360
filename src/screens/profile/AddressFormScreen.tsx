import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { addAddress, updateAddress, type Address } from '../../services/addressService';

const AddressFormScreen = () => {
  const { colors } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingAddress = route.params?.address as Address | undefined;
  const watchIdRef = useRef<number | null>(null);

  const [name, setName] = useState(editingAddress?.name || '');
  const [street, setStreet] = useState(editingAddress?.street || '');
  const [city, setCity] = useState(editingAddress?.city || '');
  const [state, setState] = useState(editingAddress?.state || '');
  const [zipCode, setZipCode] = useState(editingAddress?.zipCode || '');
  const [country, setCountry] = useState(editingAddress?.country || '');
  const [isDefault, setIsDefault] = useState(editingAddress?.isDefault || false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(editingAddress?.latitude || 31.5204); // Default to Lahore
  const [longitude, setLongitude] = useState<number | null>(editingAddress?.longitude || 74.3587);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Request location permission on mount
  useEffect(() => {
    requestLocationPermission();

    return () => {
      // Cleanup: stop watching location when component unmounts
      const watchId = watchIdRef.current;
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (checkResult) {
          setHasLocationPermission(true);
          return true;
        }

        return new Promise((resolve) => {
          alert(
            'Location Access',
            'Shop360 needs your location to help you add delivery addresses quickly and accurately. You can choose to allow access only while using the app or all the time.',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => {
                  setHasLocationPermission(false);
                  resolve(false);
                },
              },
              {
                text: 'Allow',
                onPress: async () => {
                  try {
                    const granted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                      {
                        title: 'Location Permission',
                        message: 'Shop360 would like to access your location',
                        buttonPositive: 'Allow',
                        buttonNegative: 'Deny',
                      },
                    );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                      setHasLocationPermission(true);
                      resolve(true);
                    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                      alert(
                        'Permission Required',
                        'Location permission has been blocked. Please enable it in Settings > Apps > Shop360 > Permissions.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Open Settings',
                            onPress: () => Linking.openSettings(),
                          },
                        ],
                      );
                      setHasLocationPermission(false);
                      resolve(false);
                    } else {
                      setHasLocationPermission(false);
                      resolve(false);
                    }
                  } catch (err) {
                    console.warn(err);
                    setHasLocationPermission(false);
                    resolve(false);
                  }
                },
              },
            ],
          );
        });
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // iOS
      try {
        const authStatus = await Geolocation.requestAuthorization('whenInUse');
        const granted = authStatus === 'granted';
        setHasLocationPermission(granted);

        if (!granted) {
          alert(
            'Location Access',
            'To use this feature, please enable location access in Settings > Privacy > Location Services > Shop360',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ],
          );
        }

        return granted;
      } catch (error) {
        console.warn('iOS authorization error:', error);
        setHasLocationPermission(false);
        return false;
      }
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<any> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'Shop360-Mobile-App',
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      alert(
        'Location Service Unavailable',
        'Location services are not available. Please check your device settings.',
      );
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationStatus('Permission denied');
      return;
    }

    setGettingLocation(true);
    setLocationStatus('Getting your location...');

    try {
      const position = await new Promise<any>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      });

      const { latitude: lat, longitude: lon } = position.coords;
      setLatitude(lat);
      setLongitude(lon);
      setLocationStatus('Getting address details...');

      const geocodeData = await reverseGeocode(lat, lon);

      // Debug: Log the response to see what fields are available
      console.log('Geocode response:', JSON.stringify(geocodeData, null, 2));

      if (geocodeData && geocodeData.address) {
        const addr = geocodeData.address;

        // Only use the 'city' field for city (not town, village, etc.)
        if (addr.city) {
          setCity(addr.city);
          console.log('City set to:', addr.city);
        }

        if (addr.state) {
          setState(addr.state);
        }
        if (addr.postcode) {
          setZipCode(addr.postcode);
        }
        if (addr.country) {
          setCountry(addr.country);
        }

        setLocationStatus('Location set successfully!');
        alert(
          'Location Set',
          addr.city
            ? `Your location has been set. City "${addr.city}" and other fields have been auto-filled. Please enter your street address.`
            : 'Your location has been set. Please enter your street address and city.',
        );
      } else {
        console.warn('No address data in geocode response:', geocodeData);
        setLocationStatus(`Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        alert(
          'Location Set',
          `Location has been set to:\n${lat.toFixed(6)}, ${lon.toFixed(
            6,
          )}\n\nPlease fill in the address details manually.`,
        );
      }
    } catch (error: any) {
      console.error('Location error:', error);
      let errorMessage = 'Failed to get your location. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 1:
            errorMessage = 'Location permission denied. Please enable it in settings.';
            break;
          case 2:
            errorMessage = 'Location information is unavailable.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setLocationStatus('Location error');
      alert('Location Error', errorMessage);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (
      !name.trim() ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zipCode.trim() ||
      !country.trim()
    ) {
      alert('Validation Error', 'Please fill in all address fields.');
      return;
    }

    setLoading(true);
    try {
      const addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        isDefault,
        latitude: latitude,
        longitude: longitude,
      };

      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
        alert('Success', 'Address updated successfully.');
      } else {
        await addAddress(addressData);
        alert('Success', 'Address added successfully.');
      }

      navigation.goBack();
    } catch (error: any) {
      alert('Error', error.message || 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </Text>

        {/* Location Controls */}
        <View
          style={[
            styles.locationCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: colors.primary }]}
            onPress={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons name="navigate" size={20} color={colors.background} />
            )}
            <Text style={[styles.locationButtonText, { color: colors.background }]}>
              {gettingLocation ? 'Locating...' : 'Get Current Location'}
            </Text>
          </TouchableOpacity>

          {locationStatus && (
            <View style={styles.locationStatusContainer}>
              <Ionicons
                name={
                  locationStatus.includes('error') || locationStatus.includes('denied')
                    ? 'alert-circle'
                    : 'checkmark-circle'
                }
                size={16}
                color={
                  locationStatus.includes('error') || locationStatus.includes('denied')
                    ? '#FF3B30'
                    : colors.primary
                }
              />
              <Text style={[styles.locationStatusText, { color: colors.textSecondary }]}>
                {locationStatus}
              </Text>
            </View>
          )}

          {!hasLocationPermission && (
            <TouchableOpacity
              style={[
                styles.permissionPrompt,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
              onPress={requestLocationPermission}
            >
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Enable location access to use map features
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address Form */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Details</Text>

          {/* Address Label */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address Label</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g., Home, Office"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Street Address - Full Width */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Street Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.inputFullWidth,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your street address"
              placeholderTextColor={colors.textSecondary}
              value={street}
              onChangeText={setStreet}
              multiline
            />
          </View>

          {/* City and State - Grid Row */}
          <View style={styles.gridRow}>
            <View style={[styles.inputGroup, styles.gridItem]}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={[styles.inputGroup, styles.gridItem]}>
              <Text style={[styles.label, { color: colors.text }]}>State</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="State"
                placeholderTextColor={colors.textSecondary}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          {/* ZIP and Country - Grid Row */}
          <View style={styles.gridRow}>
            <View style={[styles.inputGroup, styles.gridItem]}>
              <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="ZIP Code"
                placeholderTextColor={colors.textSecondary}
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.gridItem]}>
              <Text style={[styles.label, { color: colors.text }]}>Country</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>

          {/* Default Address Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsDefault(!isDefault)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isDefault ? colors.primary : 'transparent',
                  borderColor: isDefault ? colors.primary : colors.border,
                },
              ]}
            >
              {isDefault && <Ionicons name="checkmark" size={16} color={colors.background} />}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Set as default address
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.background }]}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Text>
          )}
        </TouchableOpacity>
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  locationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  locationStatusText: {
    fontSize: 13,
    flex: 1,
  },
  permissionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    gap: 8,
  },
  permissionText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  gridItem: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    minHeight: 50,
  },
  inputFullWidth: {
    minHeight: 60,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressFormScreen;
