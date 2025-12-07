import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  style,
  textStyle,
  disabled = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    switch (variant) {
      case 'secondary':
        return COLORS.surface;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    switch (variant) {
      case 'secondary':
        return COLORS.text;
      case 'outline':
        return COLORS.primary;
      default:
        return COLORS.secondary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: 100, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});


