import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface ButtonProps extends PropsWithChildren {
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onPress, variant = 'primary' }: ButtonProps) {
  return <Pressable onPress={onPress} style={[styles.button, variant === 'secondary' && styles.secondary]}><Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{children}</Text></Pressable>;
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
  label: { color: colors.surface, fontWeight: '700' },
  secondaryLabel: { color: colors.primary },
});