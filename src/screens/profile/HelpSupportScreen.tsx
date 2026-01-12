import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Linking,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { useNavigation } from '@react-navigation/native';
import { submitTicket } from '../../services/ticketService';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type SupportOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
};

const HelpSupportScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const highlightAnimation = useRef(new Animated.Value(0)).current;

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer:
        'You can track your order by going to the Orders section in your profile. Click on the specific order to view its current status and tracking information.',
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. You can manage your payment methods in the Payment Methods section.',
    },
    {
      id: '3',
      question: 'How can I return an item?',
      answer:
        'To return an item, go to the Orders section, select the order containing the item you want to return, and click on "Return Item". Follow the instructions to complete the return process.',
    },
    {
      id: '4',
      question: 'Do you ship internationally?',
      answer:
        'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can check shipping rates during checkout.',
    },
  ];

  const handleLiveChat = () => {
    // Scroll to message section (at the bottom)
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // Trigger highlight animation with a slight delay to allow scroll to complete
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(highlightAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(800),
        Animated.timing(highlightAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }, 100);
  };

  const supportOptions: SupportOption[] = [
    {
      id: '1',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubble-ellipses-outline',
      action: handleLiveChat,
    },
    {
      id: '2',
      title: 'Email Support',
      description: 'mailmeatazeem@gmail.com',
      icon: 'mail-outline',
      action: () => {
        Linking.openURL('mailto:mailmeatazeem@gmail.com').catch((err) =>
          console.error('Failed to open email:', err),
        );
      },
    },
    {
      id: '3',
      title: 'Phone Support',
      description: '+92 323 1697787',
      icon: 'call-outline',
      action: () => {
        Linking.openURL('tel:+923231697787').catch((err) =>
          console.error('Failed to open phone:', err),
        );
      },
    },
    // {
    //   id: '4',
    //   title: 'Social Media',
    //   description: 'Follow us for updates',
    //   icon: 'share-social-outline',
    //   action: () => {
    //     // Implement social media links
    //   },
    // },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Error', 'Please enter a message before submitting.');
      return;
    }

    if (!user) {
      alert('Authentication Required', 'Please sign in to submit a support ticket.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTicket(message);
      setMessage('');
      setShowSuccessMessage(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      // Scroll to show the success message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to submit ticket:', error);
      alert('Error', error?.message || 'Failed to submit your message. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Frequently Asked Questions
        </Text>
        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={[styles.faqItem, { backgroundColor: colors.surface }]}
            onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            {expandedFAQ === faq.id && (
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Contact Support
        </Text>
        <View style={styles.supportOptions}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.supportOption, { backgroundColor: colors.surface }]}
              onPress={option.action}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={option.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Send us a Message
        </Text>
          {user && (
            <TouchableOpacity
              onPress={() => navigation.navigate('MyTickets')}
              style={styles.viewTicketsButton}
            >
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.viewTicketsText, { color: colors.primary }]}>
                View My Tickets
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Animated.View
          style={[
            styles.messageContainer,
            {
              backgroundColor: colors.surface,
              borderWidth: highlightAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              }),
              borderColor: highlightAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', colors.primary],
              }),
              transform: [
                {
                  scale: highlightAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  }),
                },
              ],
            },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
              {
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSendMessage}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
            <Ionicons name="send" size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {showSuccessMessage && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <View style={styles.successTextContainer}>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Message Submitted Successfully!
              </Text>
              <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
                We've received your inquiry. You will receive a reply via email at{' '}
                {user?.email || 'your registered email'}.
              </Text>
        </View>
          </Animated.View>
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
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
    paddingTop: 0,
  },
  supportOptions: {
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    minHeight: 80,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  viewTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewTicketsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    gap: 12,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HelpSupportScreen;
