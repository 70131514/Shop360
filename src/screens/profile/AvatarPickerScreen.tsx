import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText as Text } from '../../components/common/AppText';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  AVATAR_SOURCES,
  SELECTABLE_AVATARS,
  type AvatarId,
  resolveAvatarId,
} from '../../constants/avatars';
import { updateMyAvatarId } from '../../services/userService';
import { useAppAlert } from '../../contexts/AppAlertContext';

type Category = 'male' | 'female';
type SelectableAvatarId = Exclude<AvatarId, 'admin'>;

// IDs in this app are: user, m1..m9, w1..w9 (admin is enforced by role)
const AVATAR_CATEGORIES: Record<Category, SelectableAvatarId[]> = {
  male: ['user', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'],
  female: ['user', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9'],
};

const AvatarPickerScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { user, profile, isAdmin } = useAuth();
  const { alert } = useAppAlert();

  const onboarding = route?.params?.onboarding === true;

  const isGuest = !user;
  const initialAvatarId = resolveAvatarId({
    avatarId: profile?.avatarId,
    isGuest,
    isAdmin,
  });

  const [selected, setSelected] = useState<AvatarId>(initialAvatarId);
  const [activeCategory, setActiveCategory] = useState<Category>('male');
  const [saving, setSaving] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [fade, translateY]);

  useEffect(() => {
    setSelected(initialAvatarId);
    // Determine initial category based on selected avatar
    if (initialAvatarId !== 'admin' && AVATAR_CATEGORIES.female.includes(initialAvatarId)) {
      setActiveCategory('female');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.avatarId, isAdmin, isGuest]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeCategory === 'male' ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [activeCategory, slideAnim]);

  const data = useMemo(() => {
    const allAvatars = SELECTABLE_AVATARS as SelectableAvatarId[];
    const categoryAvatars = AVATAR_CATEGORIES[activeCategory].filter((id) =>
      allAvatars.includes(id),
    );
    return categoryAvatars.length > 0 ? categoryAvatars : allAvatars;
  }, [activeCategory]);

  const handleSave = async () => {
    if (!user) {
      alert('Sign in required', 'Please sign in to choose an avatar.');
      return;
    }
    if (isAdmin) {
      alert('Admin account', 'Admin accounts use the admin avatar.');
      return;
    }
    try {
      if (saving) {
        return;
      }
      setSaving(true);
      if (onboarding) {
        // Replace so user can't go "back" to the picker during onboarding.
        navigation.replace('AvatarFinalWelcome', { avatarId: selected });
        return;
      }
      await updateMyAvatarId(selected);
      navigation.goBack();
    } catch (e: any) {
      alert('Could not save', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const title = onboarding ? 'Choose your avatar' : 'Update avatar';
  const subtitle = onboarding
    ? 'Pick one to personalize your profile.'
    : 'Changes are saved instantly.';

  const slideTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, segmentWidth],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            // Fallbacks (prevents "GO_BACK not handled" warning)
            if (onboarding) {
              navigation.navigate('AvatarWelcome');
              return;
            }
            navigation.navigate('MainTabs');
          }}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        <View style={styles.headerBtn} />
      </View>

      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY }] }]}>
        {/* Preview Card */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
            <Image source={AVATAR_SOURCES[selected]} style={styles.previewImage} />
          </View>
          <View style={styles.previewText}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
            <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Category Selector */}
        <View style={[styles.categoryContainer, { backgroundColor: colors.surface }]}>
          <View
            style={styles.categoryBtnWrapper}
            onLayout={(e) => setSegmentWidth(Math.max(0, e.nativeEvent.layout.width / 2))}
          >
            <Animated.View
              style={[
                styles.categorySlider,
                {
                  backgroundColor: colors.primary,
                  transform: [{ translateX: slideTranslate }],
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveCategory('male')}
              style={styles.categoryBtn}
            >
              <Ionicons
                name="male"
                size={18}
                color={activeCategory === 'male' ? colors.background : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: activeCategory === 'male' ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                Men
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveCategory('female')}
              style={styles.categoryBtn}
            >
              <Ionicons
                name="female"
                size={18}
                color={activeCategory === 'female' ? colors.background : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: activeCategory === 'female' ? colors.background : colors.textSecondary,
                  },
                ]}
              >
                Women
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {data.map((item) => {
              const isSelected = item === selected;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setSelected(item)}
                  style={[
                    styles.tile,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Image source={AVATAR_SOURCES[item]} style={styles.tileImg} />
                  {isSelected && (
                    <View style={[styles.check, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={16} color={colors.background} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving || isGuest || isAdmin}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.primary,
              opacity: saving || isGuest || isAdmin ? 0.6 : 1,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.saveBtnText, { color: colors.background }]}>Save Avatar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  avatarRing: {
    borderWidth: 2,
    borderRadius: 36,
    padding: 3,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  previewText: {
    marginLeft: 16,
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  previewSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  categoryContainer: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  categoryBtnWrapper: {
    flexDirection: 'row',
    position: 'relative',
    height: 44,
  },
  categorySlider: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 12,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  tileImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default AvatarPickerScreen;
