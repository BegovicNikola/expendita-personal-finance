import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Maps common icon names to SF Symbol names.
 * Find SF Symbols in the SF Symbols app: https://developer.apple.com/sf-symbols/
 */
const SF_SYMBOL_MAPPING: Record<string, SymbolViewProps['name']> = {
  'receipt-long': 'doc.text.fill',
  'qr-code-scanner': 'qrcode.viewfinder',
  'format-list-bulleted-add': 'text.badge.plus',
};

type IconSymbolName = keyof typeof SF_SYMBOL_MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={SF_SYMBOL_MAPPING[name]}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
