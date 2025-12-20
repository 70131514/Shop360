// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Simple mapping for SF Symbols to Material Icons
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'cube-outline': 'view-in-ar',
  'cart.fill': 'shopping-cart',
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string; // Kept for compatibility but unused
}) {
  return <MaterialIcons color={color as string} size={size} name={MAPPING[name]} style={style} />;
}
