import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, type } from '../constants/theme';

type ChipProps = { label: string; selected?: boolean; onPress?: () => void };

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityState={{ selected }} onPress={onPress} disabled={!onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { ...type.label, color: colors.text },
  selectedLabel: { color: colors.bg },
});