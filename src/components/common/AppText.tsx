import React, { useMemo } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useFontSize } from '../../contexts/FontSizeContext';

function scaleTextStyle(flat: TextStyle, multiplier: number): TextStyle {
  const next: TextStyle = { ...flat };
  if (typeof flat.fontSize === 'number') {
    next.fontSize = flat.fontSize * multiplier;
  }
  if (typeof flat.lineHeight === 'number') {
    next.lineHeight = flat.lineHeight * multiplier;
  }
  return next;
}

/**
 * AppText applies the app's font-size preset multiplier on top of the system font scale.
 * System scaling is still respected via `allowFontScaling` (default true).
 */
export const AppText: React.FC<TextProps> = ({ style, allowFontScaling = true, ...rest }) => {
  const { multiplier } = useFontSize();

  const override = useMemo(() => {
    const flat = StyleSheet.flatten(style) as TextStyle | undefined;
    if (!flat) {
      return undefined;
    }
    if (typeof flat.fontSize !== 'number' && typeof flat.lineHeight !== 'number') {
      return undefined;
    }
    return scaleTextStyle(flat, multiplier);
  }, [style, multiplier]);

  return <Text allowFontScaling={allowFontScaling} style={[style, override]} {...rest} />;
};
