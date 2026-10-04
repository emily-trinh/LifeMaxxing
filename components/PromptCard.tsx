import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing, type } from '../constants/theme';

type PromptCardProps = { label?: string; title: string; description?: string; onPress?: () => void };

export function PromptCard({ label = 'your mission this week', title, description, onPress }: PromptCardProps) {
	return (
		<Pressable onPress={onPress} disabled={!onPress} style={styles.card}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.title}>{title}</Text>
			{description ? <Text style={styles.description}>{description}</Text> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: { alignSelf: 'stretch', backgroundColor: colors.prompt, borderRadius: radius.lg, padding: spacing.lg },
	label: { ...type.label, color: colors.ink, opacity: 0.7 },
	title: { ...type.promptTitle, fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.ink, marginTop: spacing.sm },
	description: { ...type.body, color: colors.ink, marginTop: spacing.sm },
});