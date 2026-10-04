import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../constants/theme';

type ButtonProps = { label: string; onPress?: () => void; variant?: 'solid' | 'outline' | 'ghost'; disabled?: boolean; icon?: ReactNode; labelColor?: string; borderColor?: string };

export function Button({ label, onPress, variant = 'solid', disabled = false, icon, labelColor, borderColor }: ButtonProps) {
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, solid && styles.solid, variant === 'outline' && styles.outline, variant === 'ghost' && styles.ghost, borderColor ? { borderColor } : null, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, solid && styles.solidLabel, variant === 'ghost' && styles.ghostLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: '100%', minHeight: spacing.xl + spacing.md, borderRadius: radius.md, paddingVertical: spacing.md - spacing.xs / 2, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1 },
  solid: { backgroundColor: colors.ink, borderColor: colors.ink },
  outline: { backgroundColor: 'transparent', borderColor: colors.ink },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  label: { ...type.button },
  solidLabel: { color: colors.bg },
  ghostLabel: { color: colors.muted },
  icon: { marginRight: spacing.sm },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});

export default Button;