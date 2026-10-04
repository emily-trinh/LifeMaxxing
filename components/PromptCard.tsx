import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, type } from '../constants/theme';

type PromptCardProps = { label?: string; title: string; description?: string; completed?: boolean; onPress?: () => void };

export function PromptCard({ label = 'your mission this week', title, description, completed = false, onPress }: PromptCardProps) {
	return (
		<Pressable onPress={onPress} disabled={!onPress} style={[styles.card, completed && styles.completedCard]}>
			<View style={styles.labelRow}>
				<Text style={[styles.label, completed && styles.completedText]}>{label}</Text>
				{completed ? <Ionicons name="checkmark-circle" size={22} color={colors.successInk} /> : null}
			</View>
			<Text style={[styles.title, completed && styles.completedText]}>{title}</Text>
			{description ? <Text style={[styles.description, completed && styles.completedText]}>{description}</Text> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: { alignSelf: 'stretch', backgroundColor: colors.prompt, borderRadius: radius.lg, padding: spacing.lg },
	completedCard: { backgroundColor: colors.success },
	labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	label: { ...type.label, color: colors.ink, opacity: 0.7 },
	title: { ...type.promptTitle, fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.ink, marginTop: spacing.sm },
	description: { ...type.body, color: colors.ink, marginTop: spacing.sm },
	completedText: { color: colors.successInk },
});