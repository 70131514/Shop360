import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { addPaymentMethod, type CardType } from '../../services/paymentMethodService';
import { useAppAlert } from '../../contexts/AppAlertContext';

/**
 * Detect card type from card number
 */
function detectCardType(cardNumber: string): CardType | null {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (cleaned.length === 0) {
    return null;
  }

  // Visa: starts with 4
  if (/^4/.test(cleaned)) {
    return 'visa';
  }

  // Mastercard: starts with 5 or 2
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }

  // Discover: starts with 6
  if (/^6/.test(cleaned)) {
    return 'discover';
  }

  return null;
}

/**
 * Validate card number using Luhn algorithm
 */
function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');

  // Check if it's all digits and has valid length
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Format card number with spaces (e.g., 4242 4242 4242 4242)
 */
function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

const AddPaymentCardScreen = () => {
  const { colors } = useTheme();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const detectedCardType = detectCardType(cardNumber);

  const handleCardNumberChange = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 19 digits (max card length)
    const limited = cleaned.slice(0, 19);
    // Format with spaces
    const formatted = formatCardNumber(limited);
    setCardNumber(formatted);
  };

  const handleExpiryMonthChange = (text: string) => {
    // Only allow digits, max 2
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    // Validate month (01-12)
    if (cleaned === '' || (parseInt(cleaned, 10) >= 1 && parseInt(cleaned, 10) <= 12)) {
      setExpiryMonth(cleaned);
    }
  };

  const handleExpiryYearChange = (text: string) => {
    // Only allow digits, max 2
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    setExpiryYear(cleaned);
  };

  const handleCvvChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, '');
    // CVV is 3 digits for most cards, 4 for Amex
    const maxLength = detectedCardType === 'amex' ? 4 : 3;
    setCvv(cleaned.slice(0, maxLength));
  };

  const validateForm = (): string | null => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');

    if (!cleanedCardNumber) {
      return 'Card number is required';
    }

    if (!validateCardNumber(cleanedCardNumber)) {
      return 'Invalid card number';
    }

    if (!detectedCardType) {
      return 'Unsupported card type';
    }

    if (!expiryMonth || expiryMonth.length !== 2) {
      return 'Expiry month is required (MM)';
    }

    const month = parseInt(expiryMonth, 10);
    if (month < 1 || month > 12) {
      return 'Invalid expiry month';
    }

    if (!expiryYear || expiryYear.length !== 2) {
      return 'Expiry year is required (YY)';
    }

    // Check if card is expired
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const year = parseInt(expiryYear, 10);

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }

    const expectedCvvLength = detectedCardType === 'amex' ? 4 : 3;
    if (!cvv || cvv.length !== expectedCvvLength) {
      return `CVV is required (${expectedCvvLength} digits)`;
    }

    if (!cardholderName.trim()) {
      return 'Cardholder name is required';
    }

    if (cardholderName.trim().length < 2) {
      return 'Cardholder name must be at least 2 characters';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      alert('Validation Error', error);
      return;
    }

    try {
      setSaving(true);

      const cleanedCardNumber = cardNumber.replace(/\s/g, '');
      const last4 = cleanedCardNumber.slice(-4);

      // Format expiry month with leading zero if needed
      const formattedMonth = expiryMonth.padStart(2, '0');

      // Convert 2-digit year to 4-digit (assuming 20xx)
      const fullYear = `20${expiryYear}`;

      await addPaymentMethod({
        cardType: detectedCardType!,
        last4,
        expiryMonth: formattedMonth,
        expiryYear: fullYear,
        cardholderName: cardholderName.trim(),
        isDefault,
      });

      alert('Success', 'Payment card added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      alert('Error', err instanceof Error ? err.message : 'Failed to add payment card');
    } finally {
      setSaving(false);
    }
  };

  const getCardColor = (cardType: CardType | null) => {
    if (!cardType) return colors.border;
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
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Payment Card</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Preview */}
        <View style={[styles.cardPreview, { backgroundColor: getCardColor(detectedCardType) }]}>
          <View style={styles.cardPreviewHeader}>
            <Ionicons name="card-outline" size={32} color="#FFF" />
            {detectedCardType && (
              <View style={styles.cardTypeBadge}>
                <Text style={styles.cardTypeText}>
                  {detectedCardType.charAt(0).toUpperCase() + detectedCardType.slice(1)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardPreviewBody}>
            <Text style={styles.cardPreviewNumber}>{cardNumber || '•••• •••• •••• ••••'}</Text>
            <View style={styles.cardPreviewFooter}>
              <View>
                <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                <Text style={styles.cardPreviewValue}>
                  {cardholderName.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View style={styles.cardPreviewExpiry}>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>
                  {expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Card Number</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.textSecondary}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Cardholder Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Expiry Month</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="MM"
                placeholderTextColor={colors.textSecondary}
                value={expiryMonth}
                onChangeText={handleExpiryMonthChange}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Expiry Year</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="YY"
                placeholderTextColor={colors.textSecondary}
                value={expiryYear}
                onChangeText={handleExpiryYearChange}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              CVV {detectedCardType === 'amex' ? '(4 digits)' : '(3 digits)'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={detectedCardType === 'amex' ? '1234' : '123'}
              placeholderTextColor={colors.textSecondary}
              value={cvv}
              onChangeText={handleCvvChange}
              keyboardType="numeric"
              maxLength={detectedCardType === 'amex' ? 4 : 3}
              secureTextEntry
            />
          </View>

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
              Set as default payment method
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.saveButtonText, { color: colors.background }]}>Add Card</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingVertical: 12,
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  } as TextStyle,
  placeholder: {
    width: 40,
  } as ViewStyle,
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  } as ViewStyle,
  cardPreview: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  } as ViewStyle,
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  cardTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  } as ViewStyle,
  cardTypeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  cardPreviewBody: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 24,
  } as ViewStyle,
  cardPreviewNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 24,
  } as TextStyle,
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  } as ViewStyle,
  cardPreviewLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  } as TextStyle,
  cardPreviewValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  } as TextStyle,
  cardPreviewExpiry: {
    alignItems: 'flex-end',
  } as ViewStyle,
  form: {
    gap: 20,
  } as ViewStyle,
  inputGroup: {
    gap: 8,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  halfWidth: {
    flex: 1,
  } as ViewStyle,
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  } as ViewStyle,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  } as TextStyle,
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  } as ViewStyle,
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});

export default AddPaymentCardScreen;
