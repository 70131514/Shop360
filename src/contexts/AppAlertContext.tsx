import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/common/AppText';
import { useTheme } from './ThemeContext';

export type AppAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

type AppAlertOptions = {
  title?: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type AppAlertContextType = {
  alert: (title: string, message?: string, buttons?: AppAlertButton[]) => void;
  show: (opts: AppAlertOptions) => void;
  dismiss: () => void;
};

const AppAlertContext = createContext<AppAlertContextType | undefined>(undefined);

export const AppAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, isDark } = useTheme();

  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<AppAlertOptions>({});

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
  };

  const animateOut = (done: () => void) => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.98, duration: 120, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        done();
      }
    });
  };

  const dismiss = () => {
    animateOut(() => {
      setVisible(false);
      setOpts({});
    });
  };

  const show = (next: AppAlertOptions) => {
    const buttons = next.buttons?.length ? next.buttons : [{ text: 'OK' }];
    setOpts({ ...next, buttons });
    setVisible(true);
    // ensure modal has mounted
    requestAnimationFrame(animateIn);
  };

  const alert = (title: string, message?: string, buttons?: AppAlertButton[]) => {
    show({ title, message, buttons });
  };

  const value = useMemo<AppAlertContextType>(() => ({ alert, show, dismiss }), [visible, opts]);

  const buttons = opts.buttons ?? [{ text: 'OK' }];
  const isTwoButtons = buttons.length === 2;

  const onBackdropPress = () => {
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    if (cancelBtn?.onPress) {
      dismiss();
      setTimeout(() => cancelBtn.onPress?.(), 0);
      return;
    }
    dismiss();
  };

  const border = colors.border;
  const cardBg = colors.surface;
  const titleColor = colors.text;
  const msgColor = colors.textSecondary;
  const overlay = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.45)';

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismiss}
      >
        <Pressable style={[styles.backdrop, { backgroundColor: overlay }]} onPress={onBackdropPress}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: border,
                opacity: fade,
                transform: [{ scale }],
              },
            ]}
          >
            {!!opts.title && <Text style={[styles.title, { color: titleColor }]}>{opts.title}</Text>}
            {!!opts.message && (
              <Text style={[styles.message, { color: msgColor }]}>{opts.message}</Text>
            )}

            <View style={[styles.buttons, isTwoButtons ? styles.buttonsRow : styles.buttonsCol]}>
              {buttons.map((b, idx) => {
                const isCancel = b.style === 'cancel';
                const isDestructive = b.style === 'destructive';
                const btnTextColor = isDestructive
                  ? '#FF3B30'
                  : isCancel
                    ? colors.textSecondary
                    : colors.primary;

                return (
                  <Pressable
                    key={`${b.text}-${idx}`}
                    onPress={() => {
                      dismiss();
                      setTimeout(() => b.onPress?.(), 0);
                    }}
                    style={[
                      styles.button,
                      {
                        borderColor: border,
                        backgroundColor: isCancel ? 'transparent' : Platform.OS === 'android' ? 'transparent' : 'transparent',
                      },
                      isTwoButtons ? styles.buttonHalf : undefined,
                    ]}
                  >
                    <Text style={[styles.buttonText, { color: btnTextColor }]}>{b.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
};

export function useAppAlert() {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    throw new Error('useAppAlert must be used within AppAlertProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    marginTop: 16,
    gap: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  buttonsCol: {
    flexDirection: 'column',
  },
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHalf: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});


