import { Pressable, Text } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';

type ButtonProps = { label: string; onPress?: () => void; variant?: 'solid' | 'outline' };

export function Button({ label, onPress, variant = 'solid' }: ButtonProps) {
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: solid ? colors.ink : 'transparent',
        borderWidth: solid ? 0 : 1.5,
        borderColor: colors.ink,
        borderRadius: radius.md,
        paddingVertical: 12,
        paddingHorizontal: 22,
        alignItems: 'center',
        opacity: pressed ? 0.8 : 1,
      })}>
      <Text style={{ color: solid ? colors.card : colors.ink, fontFamily: fonts.sansBold, fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default Button;